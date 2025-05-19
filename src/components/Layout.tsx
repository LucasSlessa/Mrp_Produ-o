import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  ClipboardList, 
  Calculator,
  MessageSquare, 
  LogOut, 
  Menu, 
  X,
  Users 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Tipo para os itens de menu
type MenuItem = {
  to: string;
  icon: React.ReactNode;
  label: string;
};

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { signOut, userDetails } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Lista de itens de menu
  const menuItems: MenuItem[] = [
    { 
      to: '/', 
      icon: <LayoutDashboard size={20} />, 
      label: 'Dashboard' 
    },
    { 
      to: '/materiais', 
      icon: <Package size={20} />, 
      label: 'Materiais' 
    },
    { 
      to: '/produtos', 
      icon: <ShoppingCart size={20} />, 
      label: 'Produtos' 
    },
    { 
      to: '/fornecedores', 
      icon: <Users size={20} />, 
      label: 'Fornecedores' 
    },
    { 
      to: '/pedidos', 
      icon: <ClipboardList size={20} />, 
      label: 'Pedidos de Produção' 
    },
    { 
      to: '/calculo-mrp', 
      icon: <Calculator size={20} />, 
      label: 'Cálculo MRP' 
    },
    { 
      to: '/chat', 
      icon: <MessageSquare size={20} />, 
      label: 'Chat' 
    },
  ];

  // Função para logout
  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  // Função para verificar se o link está ativo
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Função para abrir/fechar a sidebar no mobile
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar para desktop */}
      <aside className={`hidden md:flex md:flex-col w-64 bg-white border-r border-gray-200 shadow-sm transition-all duration-300`}>
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600">MRP Univap</h1>
          <p className="text-sm text-gray-500">Univap</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center px-4 py-3 rounded-lg ${
                isActive(item.to)
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              } transition-colors duration-200`}
            >
              {item.icon}
              <span className="ml-3">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          {userDetails && (
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                {userDetails.nome.charAt(0).toUpperCase()}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-800">{userDetails.nome}</p>
                <p className="text-xs text-gray-500">{userDetails.ra}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200"
          >
            <LogOut size={18} />
            <span className="ml-3">Sair</span>
          </button>
        </div>
      </aside>

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleSidebar}
      ></div>

      <aside 
        className={`fixed top-0 left-0 h-full w-64 bg-white z-30 md:hidden transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-600">MRP Univap</h1>
          <button onClick={toggleSidebar} className="text-gray-500">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center px-4 py-3 rounded-lg ${
                isActive(item.to)
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              } transition-colors duration-200`}
              onClick={toggleSidebar}
            >
              {item.icon}
              <span className="ml-3">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          {userDetails && (
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                {userDetails.nome.charAt(0).toUpperCase()}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-800">{userDetails.nome}</p>
                <p className="text-xs text-gray-500">{userDetails.ra}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200"
          >
            <LogOut size={18} />
            <span className="ml-3">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 py-4 sm:px-6 flex justify-between items-center">
            <button
              onClick={toggleSidebar}
              className="md:hidden text-gray-500"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-medium text-gray-800">
              {menuItems.find(item => isActive(item.to))?.label || 'Dashboard'}
            </h2>
            <div></div> {/* Placeholder for symmetry */}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;