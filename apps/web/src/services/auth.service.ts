import api from './api';
import { User } from '../types';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export class AuthService {
  static async login(data: unknown): Promise<AuthResponse> {
    const response = await api.post('/auth/login', data);
    return response.data;
  }

  static async register(data: unknown): Promise<User> {
    const response = await api.post('/auth/register', data);
    return response.data;
  }
}
