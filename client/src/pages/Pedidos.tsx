import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  SelectChangeEvent,
  Divider,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { api } from '../services/api';

interface Fornecedor {
  id: string;
  nome: string;
}

interface Material {
  id: string;
  nome: string;
  unidade: string;
  preco: number;
}

interface PedidoItem {
  material_id: string;
  quantidade: number;
  valor_unitario: number;
}

interface Pedido {
  id: string;
  numero_pedido: string;
  fornecedor_id: string;
  fornecedor_nome: string;
  data_pedido: string;
  data_previsao: string;
  valor_total: number;
  status: 'pendente' | 'aprovado' | 'enviado' | 'recebido' | 'cancelado';
  observacoes: string;
}

export default function Pedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [selectedPedidoDetails, setSelectedPedidoDetails] = useState<Pedido | null>(null);
  const [novoPedido, setNovoPedido] = useState({
    fornecedor_id: '',
    data_previsao: '',
    observacoes: '',
    itens: [] as PedidoItem[],
  });
  const [novoItem, setNovoItem] = useState({
    material_id: '',
    quantidade: 1,
    valor_unitario: 0,
  });

  useEffect(() => {
    carregarPedidos();
    carregarFornecedores();
    carregarMateriais();
  }, []);

  const carregarPedidos = async () => {
    try {
      const response = await api.get('/pedidos');
      setPedidos(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
      setPedidos([]);
    }
  };

  const carregarFornecedores = async () => {
    try {
      const response = await api.get('/fornecedores');
      setFornecedores(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Erro ao carregar fornecedores:', error);
      setFornecedores([]);
    }
  };

  const carregarMateriais = async () => {
    try {
      const response = await api.get('/materiais');
      setMateriais(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Erro ao carregar materiais:', error);
      setMateriais([]);
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setNovoPedido({
      fornecedor_id: '',
      data_previsao: '',
      observacoes: '',
      itens: [],
    });
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleOpenStatusDialog = (pedido: Pedido) => {
    setSelectedPedido(pedido);
    setOpenStatusDialog(true);
  };

  const handleCloseStatusDialog = () => {
    setOpenStatusDialog(false);
    setSelectedPedido(null);
  };

  const handleOpenDetailsDialog = async (pedido: Pedido) => {
    try {
      const response = await api.get(`/pedidos/${pedido.id}`);
      setSelectedPedidoDetails(response.data);
      setOpenDetailsDialog(true);
    } catch (error) {
      console.error('Erro ao carregar detalhes do pedido:', error);
    }
  };

  const handleCloseDetailsDialog = () => {
    setOpenDetailsDialog(false);
    setSelectedPedidoDetails(null);
  };

  const handleAddItem = () => {
    if (novoItem.material_id && novoItem.quantidade > 0) {
      setNovoPedido({
        ...novoPedido,
        itens: [...novoPedido.itens, { ...novoItem }],
      });
      setNovoItem({
        material_id: '',
        quantidade: 1,
        valor_unitario: 0,
      });
    }
  };

  const handleRemoveItem = (index: number) => {
    const novosItens = [...novoPedido.itens];
    novosItens.splice(index, 1);
    setNovoPedido({
      ...novoPedido,
      itens: novosItens,
    });
  };

  const handleMaterialChange = (event: SelectChangeEvent) => {
    const materialId = event.target.value;
    const material = materiais.find(m => m.id === materialId);
    setNovoItem({
      ...novoItem,
      material_id: materialId,
      valor_unitario: material?.preco || 0,
    });
  };

  const handleSubmit = async () => {
    try {
      await api.post('/pedidos', novoPedido);
      handleCloseDialog();
      carregarPedidos();
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
    }
  };

  const handleStatusChange = async (status: Pedido['status']) => {
    if (!selectedPedido) return;

    try {
      await api.put(`/pedidos/${selectedPedido.id}/status`, { status });
      handleCloseStatusDialog();
      carregarPedidos();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const getStatusColor = (status: Pedido['status']) => {
    const colors = {
      pendente: '#ffa726',
      aprovado: '#66bb6a',
      enviado: '#42a5f5',
      recebido: '#7e57c2',
      cancelado: '#ef5350',
    };
    return colors[status];
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Pedidos</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Novo Pedido
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Número</TableCell>
              <TableCell>Fornecedor</TableCell>
              <TableCell>Data</TableCell>
              <TableCell>Previsão</TableCell>
              <TableCell>Valor Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(pedidos) && pedidos.length > 0 ? (
              pedidos.map((pedido) => (
                <TableRow key={pedido.id}>
                  <TableCell>{pedido.numero_pedido}</TableCell>
                  <TableCell>{pedido.fornecedor_nome}</TableCell>
                  <TableCell>
                    {format(new Date(pedido.data_pedido), 'dd/MM/yyyy', { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    {format(new Date(pedido.data_previsao), 'dd/MM/yyyy', { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(pedido.valor_total)}
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        backgroundColor: getStatusColor(pedido.status),
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        display: 'inline-block',
                      }}
                    >
                      {pedido.status.charAt(0).toUpperCase() + pedido.status.slice(1)}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenDetailsDialog(pedido)}
                      sx={{ mr: 1 }}
                      title="Ver detalhes"
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenStatusDialog(pedido)}
                      title="Atualizar status"
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Nenhum pedido encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog para novo pedido */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Novo Pedido</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Select
                fullWidth
                value={novoPedido.fornecedor_id}
                onChange={(e) => setNovoPedido({ ...novoPedido, fornecedor_id: e.target.value })}
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Selecione um fornecedor
                </MenuItem>
                {Array.isArray(fornecedores) && fornecedores.map((fornecedor) => (
                  <MenuItem key={fornecedor.id} value={fornecedor.id}>
                    {fornecedor.nome}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="date"
                label="Data de Previsão"
                value={novoPedido.data_previsao}
                onChange={(e) => setNovoPedido({ ...novoPedido, data_previsao: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Observações"
                value={novoPedido.observacoes}
                onChange={(e) => setNovoPedido({ ...novoPedido, observacoes: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Itens do Pedido
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Select
                    fullWidth
                    value={novoItem.material_id}
                    onChange={handleMaterialChange}
                    displayEmpty
                  >
                    <MenuItem value="" disabled>
                      Selecione um material
                    </MenuItem>
                    {Array.isArray(materiais) && materiais.map((material) => (
                      <MenuItem key={material.id} value={material.id}>
                        {material.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Quantidade"
                    value={novoItem.quantidade}
                    onChange={(e) =>
                      setNovoItem({ ...novoItem, quantidade: Number(e.target.value) })
                    }
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Valor Unitário"
                    value={novoItem.valor_unitario}
                    onChange={(e) =>
                      setNovoItem({ ...novoItem, valor_unitario: Number(e.target.value) })
                    }
                  />
                </Grid>
                <Grid item xs={2}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={handleAddItem}
                    sx={{ height: '56px' }}
                  >
                    Adicionar
                  </Button>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Material</TableCell>
                      <TableCell>Quantidade</TableCell>
                      <TableCell>Valor Unitário</TableCell>
                      <TableCell>Total</TableCell>
                      <TableCell>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {novoPedido.itens.map((item, index) => {
                      const material = materiais.find((m) => m.id === item.material_id);
                      return (
                        <TableRow key={index}>
                          <TableCell>{material?.nome}</TableCell>
                          <TableCell>{item.quantidade}</TableCell>
                          <TableCell>
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(item.valor_unitario)}
                          </TableCell>
                          <TableCell>
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(item.quantidade * item.valor_unitario)}
                          </TableCell>
                          <TableCell>
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => handleRemoveItem(index)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={!novoPedido.fornecedor_id || !novoPedido.data_previsao || novoPedido.itens.length === 0}
          >
            Criar Pedido
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para atualizar status */}
      <Dialog open={openStatusDialog} onClose={handleCloseStatusDialog}>
        <DialogTitle>Atualizar Status do Pedido</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Pedido: {selectedPedido?.numero_pedido}
            </Typography>
            <Typography variant="subtitle2" gutterBottom>
              Status Atual: {selectedPedido?.status}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleStatusChange('aprovado')}
                sx={{ mr: 1 }}
              >
                Aprovar
              </Button>
              <Button
                variant="contained"
                color="info"
                onClick={() => handleStatusChange('enviado')}
                sx={{ mr: 1 }}
              >
                Enviar
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={() => handleStatusChange('recebido')}
                sx={{ mr: 1 }}
              >
                Receber
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => handleStatusChange('cancelado')}
              >
                Cancelar
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStatusDialog}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Detalhes do Pedido */}
      <Dialog open={openDetailsDialog} onClose={handleCloseDetailsDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Detalhes do Pedido {selectedPedidoDetails?.numero_pedido}
        </DialogTitle>
        <DialogContent>
          {selectedPedidoDetails && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Informações Gerais
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Fornecedor:</Typography>
                      <Typography>{selectedPedidoDetails.fornecedor_nome}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Status:</Typography>
                      <Typography>
                        <Box
                          component="span"
                          sx={{
                            backgroundColor: getStatusColor(selectedPedidoDetails.status),
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            display: 'inline-block',
                          }}
                        >
                          {selectedPedidoDetails.status.charAt(0).toUpperCase() + selectedPedidoDetails.status.slice(1)}
                        </Box>
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Data do Pedido:</Typography>
                      <Typography>
                        {format(new Date(selectedPedidoDetails.data_pedido), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Data de Previsão:</Typography>
                      <Typography>
                        {format(new Date(selectedPedidoDetails.data_previsao), 'dd/MM/yyyy', { locale: ptBR })}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2">Observações:</Typography>
                      <Typography>{selectedPedidoDetails.observacoes || 'Nenhuma observação'}</Typography>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Itens do Pedido
                  </Typography>
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Material</TableCell>
                          <TableCell>Quantidade</TableCell>
                          <TableCell>Valor Unitário</TableCell>
                          <TableCell>Total</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedPedidoDetails.itens?.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.material_nome}</TableCell>
                            <TableCell>{item.quantidade} {item.unidade}</TableCell>
                            <TableCell>
                              {new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                              }).format(item.valor_unitario)}
                            </TableCell>
                            <TableCell>
                              {new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                              }).format(item.valor_total)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Histórico de Atualizações
                  </Typography>
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Data</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Usuário</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedPedidoDetails.historico?.map((registro, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              {format(new Date(registro.data), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                            </TableCell>
                            <TableCell>
                              <Box
                                component="span"
                                sx={{
                                  backgroundColor: getStatusColor(registro.status),
                                  color: 'white',
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  display: 'inline-block',
                                }}
                              >
                                {registro.status.charAt(0).toUpperCase() + registro.status.slice(1)}
                              </Box>
                            </TableCell>
                            <TableCell>{registro.usuario_nome}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailsDialog}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 