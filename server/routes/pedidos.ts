import express, { Request, Response } from 'express';
import { pool } from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import { RowDataPacket } from 'mysql2';
import { authMiddleware } from '../middleware/auth';
import { AuthRequest } from '../types/express';

const router = express.Router();

// Listar todos os pedidos
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const [pedidos] = await pool.execute<RowDataPacket[]>(`
      SELECT 
        p.*,
        f.nome as fornecedor_nome,
        u.nome as usuario_nome,
        GROUP_CONCAT(CONCAT(m.nome, ' (', pi.quantidade, ' ', m.unidade, ')')) as itens
      FROM pedidos p
      INNER JOIN fornecedores f ON p.fornecedor_id = f.id
      INNER JOIN usuarios u ON p.usuario_id = u.id
      LEFT JOIN pedido_itens pi ON p.id = pi.pedido_id
      LEFT JOIN materiais m ON pi.material_id = m.id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);
    res.json(pedidos);
  } catch (error) {
    console.error('Erro ao listar pedidos:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Buscar pedido por ID
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const [pedidos] = await pool.execute<RowDataPacket[]>(`
      SELECT 
        p.*,
        f.nome as fornecedor_nome,
        u.nome as usuario_nome
      FROM pedidos p
      INNER JOIN fornecedores f ON p.fornecedor_id = f.id
      INNER JOIN usuarios u ON p.usuario_id = u.id
      WHERE p.id = ?
    `, [req.params.id]);

    if (!pedidos.length) {
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }

    const [itens] = await pool.execute<RowDataPacket[]>(`
      SELECT 
        pi.*,
        m.nome as material_nome,
        m.unidade
      FROM pedido_itens pi
      INNER JOIN materiais m ON pi.material_id = m.id
      WHERE pi.pedido_id = ?
    `, [req.params.id]);

    const pedido = {
      ...pedidos[0],
      itens
    };

    res.json(pedido);
  } catch (error) {
    console.error('Erro ao buscar pedido:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Criar novo pedido
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { fornecedor_id, data_previsao, observacoes, itens } = req.body;
    const usuario_id = (req as AuthRequest).user.id;

    // Gerar número do pedido
    const ano = new Date().getFullYear();
    const [ultimoPedido] = await connection.execute<RowDataPacket[]>(
      'SELECT numero_pedido FROM pedidos WHERE numero_pedido LIKE ? ORDER BY numero_pedido DESC LIMIT 1',
      [`PED-${ano}-%`]
    );
    const numero = ultimoPedido.length > 0 
      ? Number(ultimoPedido[0].numero_pedido.split('-')[2]) + 1 
      : 1;
    const numero_pedido = `PED-${ano}-${numero.toString().padStart(4, '0')}`;

    // Calcular valor total
    const valor_total = itens.reduce((total: number, item: any) => {
      return total + (item.quantidade * item.valor_unitario);
    }, 0);

    // Criar pedido
    const pedido_id = uuidv4();
    await connection.execute(
      `INSERT INTO pedidos (
        id, numero_pedido, fornecedor_id, usuario_id,
        data_previsao, observacoes, valor_total, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pendente')`,
      [pedido_id, numero_pedido, fornecedor_id, usuario_id, data_previsao, observacoes, valor_total]
    );

    // Criar itens do pedido
    for (const item of itens) {
      const item_id = uuidv4();
      await connection.execute(
        `INSERT INTO pedido_itens (
          id, pedido_id, material_id, quantidade,
          valor_unitario, valor_total
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          item_id,
          pedido_id,
          item.material_id,
          item.quantidade,
          item.valor_unitario,
          item.quantidade * item.valor_unitario
        ]
      );
    }

    await connection.commit();

    // Buscar pedido criado com todas as informações
    const [pedidos] = await connection.execute<RowDataPacket[]>(`
      SELECT 
        p.*,
        f.nome as fornecedor_nome,
        u.nome as usuario_nome
      FROM pedidos p
      INNER JOIN fornecedores f ON p.fornecedor_id = f.id
      INNER JOIN usuarios u ON p.usuario_id = u.id
      WHERE p.id = ?
    `, [pedido_id]);

    res.status(201).json(pedidos[0]);
  } catch (error) {
    await connection.rollback();
    console.error('Erro ao criar pedido:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  } finally {
    connection.release();
  }
});

// Atualizar status do pedido
router.put('/:id/status', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const validStatus = ['pendente', 'aprovado', 'enviado', 'recebido', 'cancelado'];

    if (!validStatus.includes(status)) {
      return res.status(400).json({ message: 'Status inválido' });
    }

    await pool.execute(
      'UPDATE pedidos SET status = ? WHERE id = ?',
      [status, req.params.id]
    );

    const [pedidos] = await pool.execute<RowDataPacket[]>(`
      SELECT 
        p.*,
        f.nome as fornecedor_nome,
        u.nome as usuario_nome
      FROM pedidos p
      INNER JOIN fornecedores f ON p.fornecedor_id = f.id
      INNER JOIN usuarios u ON p.usuario_id = u.id
      WHERE p.id = ?
    `, [req.params.id]);

    if (!pedidos.length) {
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }

    res.json(pedidos[0]);
  } catch (error) {
    console.error('Erro ao atualizar status do pedido:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Buscar pedidos atrasados
router.get('/filtro/atrasados', authMiddleware, async (req: Request, res: Response) => {
  try {
    const [pedidos] = await pool.execute<RowDataPacket[]>(`
      SELECT 
        p.*,
        f.nome as fornecedor_nome,
        u.nome as usuario_nome
      FROM pedidos p
      INNER JOIN fornecedores f ON p.fornecedor_id = f.id
      INNER JOIN usuarios u ON p.usuario_id = u.id
      WHERE p.status IN ('pendente', 'aprovado', 'enviado')
      AND p.data_previsao < CURDATE()
      ORDER BY p.data_previsao ASC
    `);
    res.json(pedidos);
  } catch (error) {
    console.error('Erro ao buscar pedidos atrasados:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Buscar pedidos pendentes
router.get('/filtro/pendentes', authMiddleware, async (req: Request, res: Response) => {
  try {
    const [pedidos] = await pool.execute<RowDataPacket[]>(`
      SELECT 
        p.*,
        f.nome as fornecedor_nome,
        u.nome as usuario_nome
      FROM pedidos p
      INNER JOIN fornecedores f ON p.fornecedor_id = f.id
      INNER JOIN usuarios u ON p.usuario_id = u.id
      WHERE p.status = 'pendente'
      ORDER BY p.created_at DESC
    `);
    res.json(pedidos);
  } catch (error) {
    console.error('Erro ao buscar pedidos pendentes:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router; 