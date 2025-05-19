import { api } from '../config/api';

export interface Fornecedor {
  id: string;
  nome: string;
  cnpj: string;
  email: string;
  telefone: string;
  endereco: string;
}

export async function listarFornecedores(): Promise<Fornecedor[]> {
  const response = await api.get('/fornecedores');
  return response.data;
}

export async function buscarFornecedor(id: string): Promise<Fornecedor> {
  const response = await api.get(`/fornecedores/${id}`);
  return response.data;
}

export async function criarFornecedor(fornecedor: Omit<Fornecedor, 'id'>): Promise<Fornecedor> {
  const response = await api.post('/fornecedores', fornecedor);
  return response.data;
}

export async function atualizarFornecedor(id: string, fornecedor: Partial<Fornecedor>): Promise<Fornecedor> {
  const response = await api.put(`/fornecedores/${id}`, fornecedor);
  return response.data;
}

export async function excluirFornecedor(id: string): Promise<void> {
  try {
    await api.delete(`/fornecedores/${id}`);
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
} 