import express, { Request, Response } from 'express';
import { RowDataPacket } from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../config/database';

const router = express.Router();

interface Material extends RowDataPacket {
  id: string;
  nome: string;
  codigo_interno: string;
  descricao: string;
  unidade: string;
  estoque_atual: number;
  estoque_minimo: number;
  estoque_maximo: number;
  lead_time: number;
  custo: number;
}

// Listar todos os materiais
router.get('/', async (req: Request, res: Response) => {
  try {
    const [materials] = await pool.execute<Material[]>('SELECT * FROM materiais ORDER BY nome');
    res.json(materials);
  } catch (error) {
    console.error('Erro ao listar materiais:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Buscar um material por ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const [materials] = await pool.execute<Material[]>(
      'SELECT * FROM materiais WHERE id = ?',
      [req.params.id]
    );
    
    if (materials.length === 0) {
      return res.status(404).json({ message: 'Material não encontrado' });
    }

    res.json(materials[0]);
  } catch (error) {
    console.error('Erro ao buscar material:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Criar um novo material
router.post('/', async (req: Request, res: Response) => {
  try {
    const material = req.body;
    const id = uuidv4();

    await pool.execute(
      `INSERT INTO materiais (
        id, nome, codigo_interno, descricao, unidade, estoque_atual,
        estoque_minimo, estoque_maximo, lead_time, custo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, material.nome, material.codigo_interno, material.descricao, material.unidade,
        material.estoque_atual || 0, material.estoque_minimo || 0,
        material.estoque_maximo || 0, material.lead_time || 0, material.custo || 0
      ]
    );

    const [newMaterial] = await pool.execute<Material[]>(
      'SELECT * FROM materiais WHERE id = ?',
      [id]
    );

    res.status(201).json(newMaterial[0]);
  } catch (error) {
    console.error('Erro ao criar material:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Atualizar um material
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const fields = Object.keys(updates)
      .map(key => `${key} = ?`)
      .join(', ');
    const values = [...Object.values(updates), id];

    await pool.execute(
      `UPDATE materiais SET ${fields} WHERE id = ?`,
      values
    );

    const [material] = await pool.execute<Material[]>(
      'SELECT * FROM materiais WHERE id = ?',
      [id]
    );

    if (material.length === 0) {
      return res.status(404).json({ message: 'Material não encontrado' });
    }

    res.json(material[0]);
  } catch (error) {
    console.error('Erro ao atualizar material:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Excluir um material
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.execute(
      'DELETE FROM materiais WHERE id = ?',
      [id]
    );

    if ((result as any).affectedRows === 0) {
      return res.status(404).json({ message: 'Material não encontrado' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir material:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Listar materiais com estoque baixo
router.get('/baixo-estoque', async (req: Request, res: Response) => {
  try {
    const [materials] = await pool.execute<Material[]>(
      'SELECT * FROM materiais WHERE estoque_atual < estoque_minimo ORDER BY estoque_atual ASC'
    );
    res.json(materials);
  } catch (error) {
    console.error('Erro ao listar materiais com estoque baixo:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router; 