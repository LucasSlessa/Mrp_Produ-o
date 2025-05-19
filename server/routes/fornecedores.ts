import express, { Request, Response } from 'express';
import { RowDataPacket } from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../config/database';

const router = express.Router();

interface Fornecedor extends RowDataPacket {
  id: string;
  nome: string;
  cnpj: string;
  email: string;
  telefone: string;
  endereco: string;
}

// Listar todos os fornecedores
router.get('/', async (req: Request, res: Response) => {
  try {
    const [fornecedores] = await pool.execute<Fornecedor[]>('SELECT * FROM fornecedores ORDER BY nome');
    res.json(fornecedores);
  } catch (error) {
    console.error('Erro ao listar fornecedores:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Buscar um fornecedor por ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const [fornecedores] = await pool.execute<Fornecedor[]>(
      'SELECT * FROM fornecedores WHERE id = ?',
      [req.params.id]
    );
    
    if (fornecedores.length === 0) {
      return res.status(404).json({ message: 'Fornecedor não encontrado' });
    }

    res.json(fornecedores[0]);
  } catch (error) {
    console.error('Erro ao buscar fornecedor:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Criar um novo fornecedor
router.post('/', async (req: Request, res: Response) => {
  try {
    const { nome, cnpj, email, telefone, endereco } = req.body;
    const id = uuidv4();

    // Verificar se o CNPJ já existe
    if (cnpj) {
      const [existingFornecedores] = await pool.execute<Fornecedor[]>(
        'SELECT id FROM fornecedores WHERE cnpj = ?',
        [cnpj]
      );

      if (existingFornecedores.length > 0) {
        return res.status(400).json({ 
          message: 'Já existe um fornecedor com este CNPJ',
          code: 'DUPLICATE_CNPJ'
        });
      }
    }

    await pool.execute(
      `INSERT INTO fornecedores (id, nome, cnpj, email, telefone, endereco)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, nome, cnpj, email, telefone, endereco]
    );

    const [fornecedor] = await pool.execute<Fornecedor[]>(
      'SELECT * FROM fornecedores WHERE id = ?',
      [id]
    );

    res.status(201).json(fornecedor[0]);
  } catch (error) {
    console.error('Erro ao criar fornecedor:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Atualizar um fornecedor
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const fields = Object.keys(updates)
      .map(key => `${key} = ?`)
      .join(', ');
    const values = [...Object.values(updates), id];

    await pool.execute(
      `UPDATE fornecedores SET ${fields} WHERE id = ?`,
      values
    );

    const [fornecedor] = await pool.execute<Fornecedor[]>(
      'SELECT * FROM fornecedores WHERE id = ?',
      [id]
    );

    if (fornecedor.length === 0) {
      return res.status(404).json({ message: 'Fornecedor não encontrado' });
    }

    res.json(fornecedor[0]);
  } catch (error) {
    console.error('Erro ao atualizar fornecedor:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Excluir um fornecedor
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Verificar se existem pedidos para este fornecedor
    const [pedidos] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM pedidos WHERE fornecedor_id = ?',
      [id]
    );

    if (pedidos[0].total > 0) {
      return res.status(400).json({ 
        message: 'Não é possível excluir este fornecedor pois existem pedidos vinculados a ele.',
        code: 'FORNECEDOR_COM_PEDIDOS'
      });
    }

    const [result] = await pool.execute(
      'DELETE FROM fornecedores WHERE id = ?',
      [id]
    );

    if ((result as any).affectedRows === 0) {
      return res.status(404).json({ message: 'Fornecedor não encontrado' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir fornecedor:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router; 