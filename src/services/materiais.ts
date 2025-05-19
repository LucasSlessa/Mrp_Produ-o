import { api } from '../config/api';

export interface Material {
  id: string;
  nome: string;
  descricao: string;
  codigo_interno: string;
  unidade: string;
  estoque_atual: number;
  estoque_minimo: number;
  estoque_maximo: number;
  lead_time: number;
  custo: number;
}

export async function listarMateriais(): Promise<Material[]> {
  return api<Material[]>('/materiais');
}

export async function buscarMaterial(id: string): Promise<Material> {
  return api<Material>(`/materiais/${id}`);
}

export async function criarMaterial(material: Omit<Material, 'id'>): Promise<Material> {
  return api<Material>('/materiais', {
    method: 'POST',
    body: JSON.stringify(material),
  });
}

export async function atualizarMaterial(id: string, material: Partial<Material>): Promise<Material> {
  return api<Material>(`/materiais/${id}`, {
    method: 'PUT',
    body: JSON.stringify(material),
  });
}

export async function excluirMaterial(id: string): Promise<void> {
  await api(`/materiais/${id}`, {
    method: 'DELETE',
  });
}

export async function listarMateriaisBaixoEstoque(): Promise<Material[]> {
  return api<Material[]>('/materiais/baixo-estoque');
}

export async function atualizarEstoque(id: string, quantidade: number): Promise<Material> {
  return api<Material>(`/materiais/${id}/estoque`, {
    method: 'PUT',
    body: JSON.stringify({ quantidade }),
  });
} 