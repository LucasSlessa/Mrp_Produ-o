import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import materiaisRoutes from './routes/materiais';
import produtosRoutes from './routes/produtos';
import pedidosRoutes from './routes/pedidos';
import fornecedoresRoutes from './routes/fornecedores';
import { authenticateToken } from './middleware/auth';

const app = express();

app.use(cors());
app.use(express.json());

// Rotas públicas
app.use('/auth', authRoutes);

// Rotas protegidas
app.use('/materiais', authenticateToken, materiaisRoutes);
app.use('/produtos', authenticateToken, produtosRoutes);
app.use('/pedidos', authenticateToken, pedidosRoutes);
app.use('/fornecedores', authenticateToken, fornecedoresRoutes);

export default app; 