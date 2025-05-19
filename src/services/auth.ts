import { api } from '../config/api';

export interface User {
  id: string;
  email: string;
  nome: string;
}

export async function login(email: string, password: string): Promise<User> {
  return api<User>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function register(email: string, password: string, nome: string): Promise<User> {
  return api<User>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, nome }),
  });
}

export async function logout(): Promise<void> {
  await api('/auth/logout', {
    method: 'POST',
  });
}

export async function getMe(): Promise<User> {
  return api<User>('/auth/me');
}

export async function resetarSenha(email: string, novaSenha: string): Promise<void> {
  return api<void>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email, novaSenha }),
  });
}

export async function verificarAutenticacao(): Promise<User | null> {
  try {
    return await api<User>('/auth/me');
  } catch {
    return null;
  }
} 