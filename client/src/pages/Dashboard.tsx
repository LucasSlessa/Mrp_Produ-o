import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface Pedido {
  id: string;
  numero_pedido: string;
  fornecedor_nome: string;
  data_previsao: string;
  status?: string;
  created_at?: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [pedidosPendentes, setPedidosPendentes] = useState<Pedido[]>([]);
  const [pedidosAtrasados, setPedidosAtrasados] = useState<Pedido[]>([]);
  const [ultimosPedidos, setUltimosPedidos] = useState<Pedido[]>([]);

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const response = await api.get('/pedidos/dashboard');
        setPedidosPendentes(response.data.pedidosPendentes);
        setPedidosAtrasados(response.data.pedidosAtrasados);
        setUltimosPedidos(response.data.ultimosPedidos);
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      }
    };
    fetchPedidos();
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        {/* Pedidos Pendentes */}
        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: '1 1 auto', p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="h6" gutterBottom>
                Pedidos Pendentes
              </Typography>
              <Box sx={{
                height: '300px',
                overflowY: 'auto',
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: '#f1f1f1',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#888',
                  borderRadius: '4px',
                  '&:hover': {
                    background: '#555',
                  },
                },
              }}>
                {pedidosPendentes.map((pedido) => (
                  <Paper
                    key={pedido.id}
                    sx={{
                      p: 2,
                      mb: 2,
                      backgroundColor: '#f5f5f5',
                      '&:hover': {
                        backgroundColor: '#e0e0e0',
                        cursor: 'pointer',
                      },
                    }}
                    onClick={() => navigate(`/pedidos/${pedido.id}`)}
                  >
                    <Typography variant="subtitle1" gutterBottom>
                      {pedido.numero_pedido}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Fornecedor: {pedido.fornecedor_nome}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Previsão: {new Date(pedido.data_previsao).toLocaleDateString()}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        {/* Pedidos Atrasados */}
        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: '1 1 auto', p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="h6" gutterBottom>
                Pedidos Atrasados
              </Typography>
              <Box sx={{
                height: '300px',
                overflowY: 'auto',
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: '#f1f1f1',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#888',
                  borderRadius: '4px',
                  '&:hover': {
                    background: '#555',
                  },
                },
              }}>
                {pedidosAtrasados.map((pedido) => (
                  <Paper
                    key={pedido.id}
                    sx={{
                      p: 2,
                      mb: 2,
                      backgroundColor: '#fff3e0',
                      '&:hover': {
                        backgroundColor: '#ffe0b2',
                        cursor: 'pointer',
                      },
                    }}
                    onClick={() => navigate(`/pedidos/${pedido.id}`)}
                  >
                    <Typography variant="subtitle1" gutterBottom>
                      {pedido.numero_pedido}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Fornecedor: {pedido.fornecedor_nome}
                    </Typography>
                    <Typography variant="body2" color="error">
                      Atrasado desde: {new Date(pedido.data_previsao).toLocaleDateString()}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        {/* Últimos Pedidos */}
        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: '1 1 auto', p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="h6" gutterBottom>
                Últimos Pedidos
              </Typography>
              <Box sx={{
                height: '300px',
                overflowY: 'auto',
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: '#f1f1f1',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#888',
                  borderRadius: '4px',
                  '&:hover': {
                    background: '#555',
                  },
                },
              }}>
                {ultimosPedidos.map((pedido) => (
                  <Paper
                    key={pedido.id}
                    sx={{
                      p: 2,
                      mb: 2,
                      backgroundColor: '#e8f5e9',
                      '&:hover': {
                        backgroundColor: '#c8e6c9',
                        cursor: 'pointer',
                      },
                    }}
                    onClick={() => navigate(`/pedidos/${pedido.id}`)}
                  >
                    <Typography variant="subtitle1" gutterBottom>
                      {pedido.numero_pedido}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Fornecedor: {pedido.fornecedor_nome}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Status: {pedido.status}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Data: {pedido.created_at ? new Date(pedido.created_at).toLocaleDateString() : ''}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 