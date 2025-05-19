import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Componentes de páginas
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Materials from './pages/Materials';
import Products from './pages/Products';
import Pedidos from './pages/Pedidos';
import Fornecedores from './pages/Fornecedores';
import MRPCalculation from './pages/MRPCalculation';
import Chat from './pages/Chat';
import Layout from './components/Layout';

// Rota protegida que verifica autenticação
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export default function Router() {
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      {/* Rotas protegidas */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="materiais" element={<Materials />} />
        <Route path="produtos" element={<Products />} />
        <Route path="fornecedores" element={<Fornecedores />} />
        <Route path="pedidos" element={<Pedidos />} />
        <Route path="calculo-mrp" element={<MRPCalculation />} />
        <Route path="chat" element={<Chat />} />
      </Route>
      
      {/* Rota padrão */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
} 