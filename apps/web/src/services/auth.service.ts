import api from './api';

/**
 * Logged in user profile representation.
 */
export interface AuthUser {
  /** The unique identifier of the user */
  id: string;
  /** The email address of the user */
  email: string;
}

/**
 * Response returned from a successful login or session refresh.
 * The access token is stored as an HttpOnly cookie — the body values
 * are only kept for refresh-token rotation.
 */
export interface AuthResponse {
  /** The JWT access token (also set as HttpOnly cookie) */
  accessToken: string;
  /** The JWT refresh token for renewing credentials */
  refreshToken: string;
  /** The profile of the authenticated user */
  user: AuthUser;
}

/**
 * Authentication service handling credentials submission to the API.
 */
export class AuthService {
  /**
   * Submits user login credentials to the auth endpoint.
   * The server sets the access token as an HttpOnly cookie automatically.
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
  static async register(data: unknown): Promise<AuthUser> {
    const response = await api.post('/auth/register', data);
    return response.data;
  }

  /**
   * Validates the current session by checking the HttpOnly cookie with the backend.
   * 
   * @returns A promise resolving to the authenticated user profile, or null if not authenticated.
   */
  static async me(): Promise<AuthUser | null> {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch {
      return null;
    }
  }
}
