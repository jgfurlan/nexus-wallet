import api from './api';
import { User } from '../types';

/**
 * Response returned from a successful login or session refresh.
 */
export interface AuthResponse {
  /** The JWT access token for authenticating subsequent HTTP requests */
  accessToken: string;
  /** The JWT refresh token for renewing credentials */
  refreshToken: string;
  /** The profile of the authenticated user */
  user: User;
}

/**
 * Authentication service handling credentials submission to the API.
 */
export class AuthService {
  /**
   * Submits user login credentials to the auth endpoint.
   * 
   * @param data - The login payload containing email and password.
   * @returns A promise resolving to the AuthResponse.
   */
  static async login(data: unknown): Promise<AuthResponse> {
    const response = await api.post('/auth/login', data);
    return response.data;
  }

  /**
   * Registers a new user account with the specified credentials.
   * 
   * @param data - The registration payload containing email and password.
   * @returns A promise resolving to the registered User details.
   */
  static async register(data: unknown): Promise<User> {
    const response = await api.post('/auth/register', data);
    return response.data;
  }
}
