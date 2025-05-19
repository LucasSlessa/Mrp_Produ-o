import { api } from '../config/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface Message {
  id: string;
  usuario_id: string;
  usuario_nome: string;
  conteudo: string;
  created_at: string;
}

export async function enviarMensagem(conteudo: string): Promise<Message> {
  return api<Message>('/chat/mensagens', {
    method: 'POST',
    body: JSON.stringify({ conteudo }),
  });
}

export async function buscarMensagens(): Promise<Message[]> {
  return api<Message[]>('/chat/mensagens');
}

export function assinarMensagens(onMensagem: (mensagem: Message) => void): () => void {
  const eventSource = new EventSource(`${API_URL}/chat/stream`, {
    withCredentials: true
  });

  eventSource.onmessage = (event) => {
    const mensagem = JSON.parse(event.data);
    onMensagem(mensagem);
  };

  // Retorna uma função para cancelar a assinatura
  return () => eventSource.close();
} 