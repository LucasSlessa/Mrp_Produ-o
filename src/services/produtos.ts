import { api } from '../config/api';

export interface Produto {
  id: string;
  nome: string;
  codigo_interno: string;
  descricao: string;
  unidade: string;
  preco: number;
  tempo_producao: number;
  lote_minimo: number;
  lote_multiplo: number;
}

export interface BOMItem {
  id: string;
  produto_id: string;
  material_id: string;
  material_nome?: string;
  material_unidade?: string;
  quantidade: number;
}

export async function listarProdutos(): Promise<Produto[]> {
  return api<Produto[]>('/produtos');
}

export async function buscarProduto(id: string): Promise<Produto> {
  return api<Produto>(`/produtos/${id}`);
}

export async function criarProduto(produto: Omit<Produto, 'id'>): Promise<Produto> {
  return api<Produto>('/produtos', {
    method: 'POST',
    body: JSON.stringify(produto),
  });
}

export async function atualizarProduto(id: string, produto: Partial<Produto>): Promise<Produto> {
  return api<Produto>(`/produtos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(produto),
  });
}

export async function excluirProduto(id: string): Promise<void> {
  const response = await api<void>(`/produtos/${id}`, {
    method: 'DELETE',
  });
  return response;
}

export async function buscarProdutoComMateriais(id: string): Promise<{ materiais: BOMItem[] }> {
  const materiais = await api<BOMItem[]>(`/produtos/${id}/materiais`);
  return { materiais };
}

export async function adicionarMaterialAoProduto(produto_id: string, material_id: string, quantidade: number): Promise<BOMItem> {
  return api<BOMItem>(`/produtos/${produto_id}/materiais`, {
    method: 'POST',
    body: JSON.stringify({ material_id, quantidade }),
  });
}

export async function removerMaterialDoProduto(produto_id: string, material_id: string): Promise<void> {
  await api(`/produtos/${produto_id}/materiais/${material_id}`, {
    method: 'DELETE',
  });
} 