import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Router from './Router';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Router />
        <Toaster position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  );
}