import { pool } from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import { RowDataPacket, OkPacket } from 'mysql2';

interface PedidoItem {
  material_id: string;
  quantidade: number;
  valor_unitario: number;
}

interface Material extends RowDataPacket {
  id: string;
  fornecedor_id: string | null;
  prazo_entrega: number;
  estoque_atual: number;
  estoque_maximo: number;
  estoque_minimo: number;
  quantidade_necessaria: number;
  custo: number;
  nome: string;
  unidade: string;
}

interface UltimoPedido extends RowDataPacket {
  numero_pedido: string;
}

interface Comprador extends RowDataPacket {
  id: string;
}

export async function verificarEstoqueBaixo(): Promise<Material[]> {
  try {
    const [materiais] = await pool.execute<Material[]>(`
      SELECT m.*, f.id as fornecedor_id, f.prazo_entrega
      FROM materiais m
      LEFT JOIN fornecedores f ON m.fornecedor_id = f.id
      WHERE m.estoque_atual <= m.estoque_minimo
    `);

    return materiais;
  } catch (error) {
    console.error('Erro ao verificar estoque baixo:', error);
    throw error;
  }
}

export async function criarPedidoAutomatico(
  fornecedor_id: string,
  usuario_id: string,
  itens: PedidoItem[]
) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Criar número do pedido (formato: PED-ANO-NÚMERO)
    const ano = new Date().getFullYear();
    const [ultimoPedido] = await connection.execute<UltimoPedido[]>(
      'SELECT numero_pedido FROM pedidos WHERE numero_pedido LIKE ? ORDER BY numero_pedido DESC LIMIT 1',
      [`PED-${ano}-%`]
    );
    const numero = ultimoPedido.length > 0 
      ? Number(ultimoPedido[0].numero_pedido.split('-')[2]) + 1 
      : 1;
    const numero_pedido = `PED-${ano}-${numero.toString().padStart(4, '0')}`;

    // Calcular valor total do pedido
    const valor_total = itens.reduce((total, item) => {
      return total + (item.quantidade * item.valor_unitario);
    }, 0);

    // Criar pedido
    const pedido_id = uuidv4();
    await connection.execute(
      `INSERT INTO pedidos (
        id, numero_pedido, fornecedor_id, usuario_id, tipo,
        valor_total, status, data_previsao
      ) VALUES (?, ?, ?, ?, 'automatico', ?, 'pendente', DATE_ADD(NOW(), INTERVAL 
        (SELECT prazo_entrega FROM fornecedores WHERE id = ?) DAY))`,
      [pedido_id, numero_pedido, fornecedor_id, usuario_id, valor_total, fornecedor_id]
    );

    // Criar itens do pedido
    for (const item of itens) {
      const item_id = uuidv4();
      await connection.execute(
        `INSERT INTO pedido_itens (
          id, pedido_id, material_id, quantidade,
          valor_unitario, valor_total
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          item_id,
          pedido_id,
          item.material_id,
          item.quantidade,
          item.valor_unitario,
          item.quantidade * item.valor_unitario
        ]
      );
    }

    // Criar notificação para o comprador
    const notificacao_id = uuidv4();
    await connection.execute(
      `INSERT INTO notificacoes (
        id, usuario_id, titulo, mensagem, tipo
      ) VALUES (?, 
        (SELECT id FROM usuarios WHERE tipo = 'comprador' LIMIT 1),
        ?, ?, 'warning'
      )`,
      [
        notificacao_id,
        'Novo Pedido Automático',
        `Pedido ${numero_pedido} criado automaticamente devido a baixo estoque.`
      ]
    );

    await connection.commit();
    return { pedido_id, numero_pedido };
  } catch (error) {
    await connection.rollback();
    console.error('Erro ao criar pedido automático:', error);
    throw error;
  } finally {
    connection.release();
  }
}

export async function calcularQuantidadePedido(material_id: string): Promise<number> {
  try {
    const [material] = await pool.execute<Material[]>(`
      SELECT 
        m.*,
        COALESCE(SUM(pm.quantidade), 0) as quantidade_necessaria
      FROM materiais m
      LEFT JOIN produto_materiais pm ON m.id = pm.material_id
      WHERE m.id = ?
      GROUP BY m.id
    `, [material_id]);

    if (!material.length) return 0;

    const { estoque_atual, estoque_maximo, estoque_minimo, quantidade_necessaria } = material[0];
    
    // Calcular quantidade ideal considerando:
    // 1. Estoque máximo
    // 2. Quantidade necessária para produção
    // 3. Lead time do fornecedor
    const quantidade_pedido = Math.max(
      estoque_maximo - estoque_atual,
      quantidade_necessaria * 1.1 // 10% de margem de segurança
    );

    return Math.ceil(quantidade_pedido);
  } catch (error) {
    console.error('Erro ao calcular quantidade do pedido:', error);
    throw error;
  }
}

export async function verificarEGerarPedidosAutomaticos() {
  try {
    // Buscar materiais com estoque baixo
    const materiaisBaixoEstoque = await verificarEstoqueBaixo();

    // Agrupar materiais por fornecedor
    const pedidosPorFornecedor = materiaisBaixoEstoque.reduce<Record<string, Material[]>>((acc, material) => {
      if (!material.fornecedor_id) return acc;
      
      if (!acc[material.fornecedor_id]) {
        acc[material.fornecedor_id] = [];
      }

      acc[material.fornecedor_id].push(material);
      return acc;
    }, {});

    // Criar pedidos automáticos para cada fornecedor
    const pedidosCriados = [];
    for (const [fornecedor_id, materiais] of Object.entries(pedidosPorFornecedor)) {
      const itens = await Promise.all(materiais.map(async (material) => {
        const quantidade = await calcularQuantidadePedido(material.id);
        return {
          material_id: material.id,
          quantidade,
          valor_unitario: material.custo
        };
      }));

      // Buscar usuário comprador
      const [compradores] = await pool.execute<Comprador[]>(
        'SELECT id FROM usuarios WHERE tipo = "comprador" LIMIT 1'
      );
      const comprador_id = compradores[0]?.id;

      if (comprador_id && itens.length > 0) {
        const pedido = await criarPedidoAutomatico(
          fornecedor_id,
          comprador_id,
          itens
        );
        pedidosCriados.push(pedido);
      }
    }

    return pedidosCriados;
  } catch (error) {
    console.error('Erro ao verificar e gerar pedidos automáticos:', error);
    throw error;
  }
} 