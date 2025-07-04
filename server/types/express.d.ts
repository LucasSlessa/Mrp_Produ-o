import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        nome: string;
        email: string;
        role: string;
      };
    }
  }
}

export interface AuthRequest extends Request {
  user: {
    id: string;
    nome: string;
    email: string;
    role: string;
  };
} 