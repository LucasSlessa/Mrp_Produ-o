import { CronJob } from 'cron';
import { verificarEGerarPedidosAutomaticos } from './pedidos';
import { pool } from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import { RowDataPacket } from 'mysql2';

interface Admin extends RowDataPacket {
  id: string;
}

interface PedidoAtrasado extends RowDataPacket {
  id: string;
  fornecedor_nome: string;
}

// Verificar estoque todos os dias às 8h da manhã
const verificarEstoqueJob = new CronJob('0 8 * * *', async () => {
  console.log('Iniciando verificação automática de estoque...');
  try {
    const pedidosCriados = await verificarEGerarPedidosAutomaticos();
    
    if (pedidosCriados.length > 0) {
      console.log(`${pedidosCriados.length} pedidos automáticos criados`);
      
      // Notificar administradores
      const [admins] = await pool.execute<Admin[]>('SELECT id FROM usuarios WHERE tipo = "admin"');
      
      for (const admin of admins) {
        await pool.execute(
          `INSERT INTO notificacoes (id, usuario_id, titulo, mensagem, tipo)
           VALUES (?, ?, ?, ?, 'info')`,
          [
            uuidv4(),
            admin.id,
            'Pedidos Automáticos Gerados',
            `${pedidosCriados.length} pedidos foram gerados automaticamente devido a baixo estoque.`
          ]
        );
      }
    } else {
      console.log('Nenhum pedido automático necessário');
    }
  } catch (error) {
    console.error('Erro na verificação automática de estoque:', error);
    
    // Notificar erro aos administradores
    try {
      const [admins] = await pool.execute<Admin[]>('SELECT id FROM usuarios WHERE tipo = "admin"');
      
      for (const admin of admins) {
        await pool.execute(
          `INSERT INTO notificacoes (id, usuario_id, titulo, mensagem, tipo)
           VALUES (?, ?, ?, ?, 'error')`,
          [
            uuidv4(),
            admin.id,
            'Erro na Verificação de Estoque',
            'Ocorreu um erro ao verificar automaticamente o estoque. Verifique os logs do sistema.'
          ]
        );
      }
    } catch (notifError) {
      console.error('Erro ao notificar administradores:', notifError);
    }
  }
});

// Verificar materiais vencendo o prazo de entrega às 9h da manhã
const verificarPrazosJob = new CronJob('0 9 * * *', async () => {
  console.log('Verificando prazos de entrega...');
  try {
    const [pedidosAtrasados] = await pool.execute<PedidoAtrasado[]>(`
      SELECT p.*, f.nome as fornecedor_nome
      FROM pedidos p
      INNER JOIN fornecedores f ON p.fornecedor_id = f.id
      WHERE p.status IN ('pendente', 'aprovado', 'enviado')
      AND p.data_previsao < CURDATE()
    `);

    if (pedidosAtrasados.length > 0) {
      // Notificar compradores
      const [compradores] = await pool.execute<Admin[]>('SELECT id FROM usuarios WHERE tipo = "comprador"');
      
      for (const comprador of compradores) {
        await pool.execute(
          `INSERT INTO notificacoes (id, usuario_id, titulo, mensagem, tipo)
           VALUES (?, ?, ?, ?, 'warning')`,
          [
            uuidv4(),
            comprador.id,
            'Pedidos com Prazo Vencido',
            `Existem ${pedidosAtrasados.length} pedidos com prazo de entrega vencido.`
          ]
        );
      }
    }
  } catch (error) {
    console.error('Erro ao verificar prazos de entrega:', error);
  }
});

export function iniciarAgendamentos() {
  verificarEstoqueJob.start();
  verificarPrazosJob.start();
  console.log('Agendamentos iniciados');
}

export function pararAgendamentos() {
  verificarEstoqueJob.stop();
  verificarPrazosJob.stop();
  console.log('Agendamentos parados');
} 