import { api } from '../config/api';

export interface DashboardCounts {
  materials: number;
  products: number;
  orders: number;
}

export interface RecentOrder {
  id: string;
  numero_pedido: string;
  fornecedor_nome: string;
  valor_total: number;
  status: string;
  data_pedido: string;
  data_previsao: string | null;
  itens: string;
}

export interface LowStockMaterial {
  id: string;
  nome: string;
  estoque_atual: number;
  unidade: string;
}

export async function getDashboardCounts(): Promise<DashboardCounts> {
  return api<DashboardCounts>('/dashboard/counts');
}

export async function getRecentOrders(): Promise<RecentOrder[]> {
  return api<RecentOrder[]>('/dashboard/recent-orders');
}

export async function getLowStockMaterials(): Promise<LowStockMaterial[]> {
  return api<LowStockMaterial[]>('/dashboard/low-stock-materials');
} 