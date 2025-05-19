import { api } from '../config/api';

export interface Pedido {
  id: string;
  numero_pedido: string;
  fornecedor_id: string;
  fornecedor_nome: string;
  usuario_id: string;
  status: 'pendente' | 'aprovado' | 'enviado' | 'recebido' | 'cancelado';
  tipo: 'manual' | 'automatico';
  data_pedido: string;
  data_previsao: string | null;
  data_recebimento: string | null;
  observacoes: string | null;
  valor_total: number;
  itens?: string;
  usuario_atualizacao_nome?: string;
  ultima_atualizacao_formatada?: string;
}

export interface PedidoItem {
  id: string;
  pedido_id: string;
  material_id: string;
  material_nome: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  unidade: string;
}

export interface NovoPedido {
  fornecedor_id: string;
  data_previsao?: string;
  observacoes?: string;
  itens: Array<{
    material_id: string;
    quantidade: number;
    valor_unitario: number;
  }>;
}

export async function listarPedidos(): Promise<Pedido[]> {
  return api<Pedido[]>('/pedidos');
}

export async function buscarPedido(id: string): Promise<Pedido> {
  return api<Pedido>(`/pedidos/${id}`);
}

export async function criarPedido(pedido: NovoPedido): Promise<Pedido> {
  return api<Pedido>('/pedidos', {
    method: 'POST',
    body: JSON.stringify(pedido)
  });
}

export async function atualizarStatusPedido(id: string, status: Pedido['status']): Promise<Pedido> {
  return api<Pedido>(`/pedidos/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  });
}

export async function excluirPedido(id: string): Promise<void> {
  return api(`/pedidos/${id}`, {
    method: 'DELETE'
  });
}

export async function listarItensPedido(pedido_id: string): Promise<PedidoItem[]> {
  return api<PedidoItem[]>(`/pedidos/${pedido_id}/itens`);
}

export async function buscarPedidosAtrasados(): Promise<Pedido[]> {
  return api<Pedido[]>('/pedidos/atrasados');
}

export async function buscarPedidosPendentes(): Promise<Pedido[]> {
  return api<Pedido[]>('/pedidos/pendentes');
} 