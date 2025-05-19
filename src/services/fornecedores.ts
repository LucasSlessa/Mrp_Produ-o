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
  return api<Fornecedor[]>('/fornecedores');
}

export async function buscarFornecedor(id: string): Promise<Fornecedor> {
  return api<Fornecedor>(`/fornecedores/${id}`);
}

export async function criarFornecedor(fornecedor: Omit<Fornecedor, 'id'>): Promise<Fornecedor> {
  return api<Fornecedor>('/fornecedores', {
    method: 'POST',
    body: JSON.stringify(fornecedor),
  });
}

export async function atualizarFornecedor(id: string, fornecedor: Partial<Fornecedor>): Promise<Fornecedor> {
  return api<Fornecedor>(`/fornecedores/${id}`, {
    method: 'PUT',
    body: JSON.stringify(fornecedor),
  });
}

export async function excluirFornecedor(id: string): Promise<void> {
  await api(`/fornecedores/${id}`, {
    method: 'DELETE',
  });
} 