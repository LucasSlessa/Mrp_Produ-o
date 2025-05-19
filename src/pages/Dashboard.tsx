import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Package, ShoppingCart, ClipboardList, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DashboardCounts, LowStockMaterial, RecentOrder, getDashboardCounts, getRecentOrders, getLowStockMaterials } from '../services/dashboard';

const Dashboard = () => {
  const { user } = useAuth();
  const [counts, setCounts] = useState<DashboardCounts>({ materials: 0, products: 0, orders: 0 });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [lowStockMaterials, setLowStockMaterials] = useState<LowStockMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dados para gráfico
  const [chartData, setChartData] = useState([
    { name: 'Produtos', quantidade: 0 },
    { name: 'Materiais', quantidade: 0 },
    { name: 'Pedidos', quantidade: 0 }
  ]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Buscar todas as informações do dashboard
        const [countsData, ordersData, materialsData] = await Promise.all([
          getDashboardCounts(),
          getRecentOrders(),
          getLowStockMaterials()
        ]);
        
        // Atualizar contagens
        setCounts(countsData);
        
        // Atualizar dados do gráfico
        setChartData([
          { name: 'Produtos', quantidade: countsData.products },
          { name: 'Materiais', quantidade: countsData.materials },
          { name: 'Pedidos', quantidade: countsData.orders }
        ]);
        
        // Atualizar pedidos recentes
        setRecentOrders(ordersData);
        
        // Atualizar materiais com baixo estoque
        setLowStockMaterials(materialsData);
        
      } catch (err: any) {
        console.error('Erro ao buscar dados do dashboard:', err);
        setError('Não foi possível carregar os dados do dashboard');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Formatação de data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Bem-vindo(a), {user?.nome || 'Aluno'}. Aqui está o resumo do sistema MRP.
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Erro</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cards de contagem */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Link to="/materiais" className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-md bg-blue-100 text-blue-600">
                <Package className="h-6 w-6" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Materiais</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {loading ? (
                        <div className="animate-pulse h-6 w-12 bg-gray-200 rounded"></div>
                      ) : (
                        counts.materials
                      )}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/produtos" className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-md bg-green-100 text-green-600">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Produtos</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {loading ? (
                        <div className="animate-pulse h-6 w-12 bg-gray-200 rounded"></div>
                      ) : (
                        counts.products
                      )}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/pedidos" className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-md bg-purple-100 text-purple-600">
                <ClipboardList className="h-6 w-6" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pedidos</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {loading ? (
                        <div className="animate-pulse h-6 w-12 bg-gray-200 rounded"></div>
                      ) : (
                        counts.orders
                      )}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Gráfico de Barras */}
      <div className="bg-white p-6 shadow rounded-lg">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Visão Geral</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="quantidade" fill="#4F46E5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Seção de Pedidos Recentes e Materiais com Baixo Estoque */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Pedidos Recentes */}
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900">Pedidos Recentes</h2>
            <div className="mt-4">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse h-12 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            {order.numero_pedido}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Fornecedor: {order.fornecedor_nome}
                          </p>
                          <p className="text-sm text-gray-500">
                            Valor: R$ {Number(order.valor_total).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500">
                            Data: {formatDate(order.data_pedido)}
                          </p>
                          {order.itens && (
                            <p className="text-sm text-gray-500 mt-1">
                              Itens: {order.itens}
                            </p>
                          )}
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          order.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'aprovado' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'enviado' ? 'bg-purple-100 text-purple-800' :
                          order.status === 'recebido' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Nenhum pedido recente</p>
              )}
            </div>
          </div>
        </div>

        {/* Materiais com Baixo Estoque */}
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900">Materiais com Baixo Estoque</h2>
            <div className="mt-4">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse h-12 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : lowStockMaterials.length > 0 ? (
                <div className="space-y-4">
                  {lowStockMaterials.map((material) => (
                    <div key={material.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            {material.nome}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Estoque: {material.estoque_atual} {material.unidade}
                          </p>
                        </div>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                          Baixo Estoque
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Nenhum material com baixo estoque</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;