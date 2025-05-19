import { useState, useEffect } from 'react';
import {
  Box,
  Button,
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
  Alert,
  Snackbar,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { listarPedidos, criarPedido, atualizarStatusPedido, excluirPedido, Pedido, NovoPedido } from '../services/pedidos';
import { listarMateriais, Material } from '../services/materiais';
import { listarFornecedores, Fornecedor } from '../services/fornecedores';

export default function Pedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [novoPedido, setNovoPedido] = useState<NovoPedido>({
    fornecedor_id: '',
    data_previsao: '',
    observacoes: '',
    itens: [],
  });
  const [novoItem, setNovoItem] = useState({
    material_id: '',
    quantidade: 1,
    valor_unitario: 0,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [pedidosData, fornecedoresData, materiaisData] = await Promise.all([
        listarPedidos(),
        listarFornecedores(),
        listarMateriais()
      ]);

      setPedidos(Array.isArray(pedidosData) ? pedidosData : []);
      setFornecedores(Array.isArray(fornecedoresData) ? fornecedoresData : []);
      setMateriais(Array.isArray(materiaisData) ? materiaisData : []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar dados. Por favor, tente novamente.',
        severity: 'error',
      });
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
    if (material) {
      setNovoItem({
        ...novoItem,
        material_id: materialId,
        valor_unitario: material.custo || 0,
      });
    }
  };

  const handleSubmit = async () => {
    try {
      if (!novoPedido.fornecedor_id || !novoPedido.data_previsao || novoPedido.itens.length === 0) {
        setSnackbar({
          open: true,
          message: 'Por favor, preencha todos os campos obrigatórios.',
          severity: 'warning',
        });
        return;
      }

      await criarPedido(novoPedido);
      setSnackbar({
        open: true,
        message: 'Pedido criado com sucesso!',
        severity: 'success',
      });
      handleCloseDialog();
      carregarDados();
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao criar pedido. Por favor, tente novamente.',
        severity: 'error',
      });
    }
  };

  const handleStatusChange = async (status: Pedido['status']) => {
    if (!selectedPedido) return;

    try {
      await atualizarStatusPedido(selectedPedido.id, status);
      setSnackbar({
        open: true,
        message: 'Status atualizado com sucesso!',
        severity: 'success',
      });
      handleCloseStatusDialog();
      carregarDados();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao atualizar status. Por favor, tente novamente.',
        severity: 'error',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este pedido?')) return;

    try {
      await excluirPedido(id);
      setSnackbar({
        open: true,
        message: 'Pedido excluído com sucesso!',
        severity: 'success',
      });
      carregarDados();
    } catch (error) {
      console.error('Erro ao excluir pedido:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao excluir pedido. Por favor, tente novamente.',
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
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
            {pedidos.map((pedido) => (
              <TableRow key={pedido.id}>
                <TableCell>{pedido.numero_pedido}</TableCell>
                <TableCell>{pedido.fornecedor_nome}</TableCell>
                <TableCell>
                  {format(new Date(pedido.data_pedido), 'dd/MM/yyyy', { locale: ptBR })}
                </TableCell>
                <TableCell>
                  {pedido.data_previsao && format(new Date(pedido.data_previsao), 'dd/MM/yyyy', { locale: ptBR })}
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
                    onClick={() => handleOpenStatusDialog(pedido)}
                  >
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
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
                {fornecedores.map((fornecedor) => (
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
                    {materiais.map((material) => (
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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 