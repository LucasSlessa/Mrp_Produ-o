import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createPool, RowDataPacket } from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import * as jwt from 'jsonwebtoken';
import materiaisRoutes from './routes/materiais';
import produtosRoutes from './routes/produtos';
import pedidosRoutes from './routes/pedidos';
import fornecedoresRoutes from './routes/fornecedores';
import { iniciarAgendamentos } from './services/scheduler';

// Interfaces para tipagem
interface Usuario extends RowDataPacket {
  id: string;
  email: string;
  nome: string;
  senha: string;
  role: string;
}

interface Mensagem extends RowDataPacket {
  id: string;
  usuario_id: string;
  usuario_nome: string;
  conteudo: string;
  created_at: string;
}

interface Contagem extends RowDataPacket {
  count: number;
}

interface AuthRequest extends Request {
  user: Usuario;
}

const app = express();
const port = process.env.PORT || 3001;

// Armazenar as conexões SSE ativas
const sseClients = new Set<{ res: Response; userId: string }>();

// Configuração do banco de dados
const pool = createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'project_bolt',
});

// Middleware
app.use(express.json());
app.use(cookieParser());

// Configuração CORS
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

// Middleware para adicionar headers CORS em todas as respostas
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || 'http://localhost:3000');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Lidar com requisições OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Middleware de autenticação
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'Não autorizado' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    pool.execute<Usuario[]>(
      'SELECT id, email, nome, role FROM usuarios WHERE id = ?',
      [decoded.userId]
    ).then(([rows]) => {
      const user = rows[0];
      if (!user) {
        return res.status(401).json({ message: 'Usuário não encontrado' });
      }
      (req as AuthRequest).user = user;
      next();
    }).catch(error => {
      res.status(401).json({ message: 'Token inválido' });
    });
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' });
  }
};

// Rotas de autenticação
app.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const [rows] = await pool.execute<Usuario[]>(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );

    const user = rows[0];
    if (!user || !await bcrypt.compare(password, user.senha)) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    const { senha, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

app.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password, nome } = req.body;
    const id = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);
    const role = 'user'; // Papel padrão para novos usuários

    await pool.execute(
      'INSERT INTO usuarios (id, email, nome, senha, role) VALUES (?, ?, ?, ?, ?)',
      [id, email, nome, hashedPassword, role]
    );

    const token = jwt.sign(
      { userId: id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({ id, email, nome, role });
  } catch (error) {
    console.error('Erro no cadastro:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

app.post('/auth/logout', (req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({ message: 'Logout realizado com sucesso' });
});

app.get('/auth/me', authMiddleware, (req: Request, res: Response) => {
  res.json((req as AuthRequest).user);
});

// Rotas do chat
app.get('/chat/mensagens', authMiddleware, async (req: Request, res: Response) => {
  try {
    const [messages] = await pool.execute<Mensagem[]>(`
      SELECT m.id, m.usuario_id, u.nome as usuario_nome, m.conteudo, m.created_at
      FROM mensagens m
      INNER JOIN usuarios u ON m.usuario_id = u.id
      ORDER BY m.created_at DESC
      LIMIT 50
    `);
    res.json(messages);
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

app.post('/chat/mensagens', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { conteudo } = req.body;
    const usuario_id = (req as AuthRequest).user.id;
    const id = uuidv4();

    await pool.execute(
      'INSERT INTO mensagens (id, usuario_id, conteudo) VALUES (?, ?, ?)',
      [id, usuario_id, conteudo]
    );

    const [messages] = await pool.execute<Mensagem[]>(`
      SELECT m.id, m.usuario_id, u.nome as usuario_nome, m.conteudo, m.created_at
      FROM mensagens m
      INNER JOIN usuarios u ON m.usuario_id = u.id
      WHERE m.id = ?
    `, [id]);

    const message = messages[0];

    // Notificar todos os clientes conectados
    sseClients.forEach(client => {
      client.res.write(`data: ${JSON.stringify(message)}\n\n`);
    });

    res.json(message);
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

app.get('/chat/stream', authMiddleware, (req: Request, res: Response) => {
  // Configurar cabeçalhos para SSE
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  // Adicionar cliente à lista de conexões
  const client = { res, userId: (req as AuthRequest).user.id };
  sseClients.add(client);

  // Enviar heartbeat a cada 30 segundos para manter a conexão
  const heartbeat = setInterval(() => {
    res.write(':\n\n');
  }, 30000);

  // Limpar quando o cliente desconectar
  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients.delete(client);
  });
});

// Rotas do dashboard
app.get('/dashboard/counts', authMiddleware, async (req: Request, res: Response) => {
  try {
    const [materials] = await pool.execute<Contagem[]>('SELECT COUNT(*) as count FROM materiais');
    const [products] = await pool.execute<Contagem[]>('SELECT COUNT(*) as count FROM produtos');
    const [orders] = await pool.execute<Contagem[]>('SELECT COUNT(*) as count FROM pedidos');

    res.json({
      materials: materials[0].count,
      products: products[0].count,
      orders: orders[0].count,
    });
  } catch (error) {
    console.error('Erro ao buscar contagens:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

app.get('/dashboard/recent-orders', authMiddleware, async (req: Request, res: Response) => {
  try {
    const [orders] = await pool.execute<RowDataPacket[]>(`
      SELECT 
        p.id,
        p.numero_pedido,
        f.nome as fornecedor_nome,
        p.valor_total,
        p.status,
        p.data_pedido,
        p.data_previsao,
        GROUP_CONCAT(CONCAT(m.nome, ' (', pi.quantidade, ' ', m.unidade, ')')) as itens
      FROM pedidos p
      INNER JOIN fornecedores f ON p.fornecedor_id = f.id
      LEFT JOIN pedido_itens pi ON p.id = pi.pedido_id
      LEFT JOIN materiais m ON pi.material_id = m.id
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT 5
    `);
    res.json(orders);
  } catch (error) {
    console.error('Erro ao buscar pedidos recentes:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

app.get('/dashboard/low-stock-materials', authMiddleware, async (req: Request, res: Response) => {
  try {
    const [materials] = await pool.execute<RowDataPacket[]>(`
      SELECT id, nome, estoque_atual, unidade
      FROM materiais
      WHERE estoque_atual < estoque_minimo
      ORDER BY estoque_atual ASC
      LIMIT 5
    `);
    res.json(materials);
  } catch (error) {
    console.error('Erro ao buscar materiais com baixo estoque:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rotas de materiais
app.use('/materiais', authMiddleware, materiaisRoutes);
app.use('/produtos', authMiddleware, produtosRoutes);
app.use('/pedidos', authMiddleware, pedidosRoutes);
app.use('/fornecedores', authMiddleware, fornecedoresRoutes);

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
  iniciarAgendamentos();
}); 