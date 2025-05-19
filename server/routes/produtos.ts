import express, { Request, Response } from 'express';
import { RowDataPacket } from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../config/database';

const router = express.Router();

interface Produto extends RowDataPacket {
  id: string;
  nome: string;
  descricao: string;
  codigo_interno: string;
  unidade: string;
  preco: number;
  tempo_producao: number;
  lote_minimo: number;
  lote_multiplo: number;
}

interface BOMItem extends RowDataPacket {
  id: string;
  produto_id: string;
  material_id: string;
  material_nome: string;
  material_unidade: string;
  quantidade: number;
}

// Listar todos os produtos
router.get('/', async (req: Request, res: Response) => {
  try {
    const [produtos] = await pool.execute<Produto[]>('SELECT * FROM produtos ORDER BY nome');
    res.json(produtos);
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Buscar um produto por ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const [produtos] = await pool.execute<Produto[]>(
      'SELECT * FROM produtos WHERE id = ?',
      [req.params.id]
    );
    
    if (produtos.length === 0) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    res.json(produtos[0]);
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Buscar estrutura de materiais de um produto
router.get('/:id/materiais', async (req: Request, res: Response) => {
  try {
    const [materiais] = await pool.execute<BOMItem[]>(`
      SELECT pm.id, pm.produto_id, pm.material_id, 
             m.nome as material_nome, m.unidade as material_unidade,
             pm.quantidade
      FROM produto_materiais pm
      INNER JOIN materiais m ON pm.material_id = m.id
      WHERE pm.produto_id = ?
      ORDER BY m.nome
    `, [req.params.id]);
    
    res.json(materiais);
  } catch (error) {
    console.error('Erro ao buscar estrutura de materiais:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Adicionar material ao produto
router.post('/:id/materiais', async (req: Request, res: Response) => {
  try {
    const { id: produto_id } = req.params;
    const { material_id, quantidade } = req.body;
    const id = uuidv4();

    // Verificar se o produto existe
    const [produtos] = await pool.execute<Produto[]>(
      'SELECT id FROM produtos WHERE id = ?',
      [produto_id]
    );

    if (produtos.length === 0) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    // Verificar se o material já está na estrutura
    const [existente] = await pool.execute<BOMItem[]>(
      'SELECT id FROM produto_materiais WHERE produto_id = ? AND material_id = ?',
      [produto_id, material_id]
    );

    if (existente.length > 0) {
      return res.status(400).json({ message: 'Material já existe na estrutura do produto' });
    }

    // Adicionar material
    await pool.execute(
      'INSERT INTO produto_materiais (id, produto_id, material_id, quantidade) VALUES (?, ?, ?, ?)',
      [id, produto_id, material_id, quantidade]
    );

    // Retornar o material adicionado com informações completas
    const [material] = await pool.execute<BOMItem[]>(`
      SELECT pm.id, pm.produto_id, pm.material_id, 
             m.nome as material_nome, m.unidade as material_unidade,
             pm.quantidade
      FROM produto_materiais pm
      INNER JOIN materiais m ON pm.material_id = m.id
      WHERE pm.id = ?
    `, [id]);

    res.status(201).json(material[0]);
  } catch (error) {
    console.error('Erro ao adicionar material:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Remover material do produto
router.delete('/:produto_id/materiais/:id', async (req: Request, res: Response) => {
  try {
    const { produto_id, id } = req.params;
    
    const [result] = await pool.execute(
      'DELETE FROM produto_materiais WHERE id = ? AND produto_id = ?',
      [id, produto_id]
    );

    if ((result as any).affectedRows === 0) {
      return res.status(404).json({ message: 'Material não encontrado na estrutura do produto' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao remover material:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Criar um novo produto
router.post('/', async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { nome, codigo_interno, descricao, unidade, preco, tempo_producao, lote_minimo, lote_multiplo } = req.body;

    // Verificar se o código interno já existe
    const [existingProducts] = await connection.execute<RowDataPacket[]>(
      'SELECT id FROM produtos WHERE codigo_interno = ?',
      [codigo_interno]
    );

    if (existingProducts.length > 0) {
      return res.status(400).json({ 
        message: 'Já existe um produto com este código interno',
        code: 'DUPLICATE_CODE'
      });
    }

    const id = uuidv4();
    await connection.execute(
      `INSERT INTO produtos (
        id, nome, codigo_interno, descricao, unidade, preco,
        tempo_producao, lote_minimo, lote_multiplo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, nome, codigo_interno, descricao, unidade, preco, tempo_producao, lote_minimo, lote_multiplo]
    );

    await connection.commit();

    const [produtos] = await connection.execute<RowDataPacket[]>(
      'SELECT * FROM produtos WHERE id = ?',
      [id]
    );

    res.status(201).json(produtos[0]);
  } catch (error) {
    await connection.rollback();
    console.error('Erro ao criar produto:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  } finally {
    connection.release();
  }
});

// Atualizar um produto
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const fields = Object.keys(updates)
      .map(key => `${key} = ?`)
      .join(', ');
    const values = [...Object.values(updates), id];

    await pool.execute(
      `UPDATE produtos SET ${fields} WHERE id = ?`,
      values
    );

    const [produto] = await pool.execute<Produto[]>(
      'SELECT * FROM produtos WHERE id = ?',
      [id]
    );

    if (produto.length === 0) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    res.json(produto[0]);
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Excluir um produto
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.execute(
      'DELETE FROM produtos WHERE id = ?',
      [id]
    );

    if ((result as any).affectedRows === 0) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir produto:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router; 