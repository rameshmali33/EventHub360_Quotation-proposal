import { fetchJson } from './api';

export interface AuthUser {
  id: number;
  tenantId: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  organizationName: string;
}

export interface AuthSession {
  accessToken: string;
  user: AuthUser;
}

export const authService = {
  signIn(email: string, password: string) {
    return fetchJson<AuthSession>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  signUp(payload: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    organizationName: string;
  }) {
    return fetchJson<AuthSession>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getProfile() {
    return fetchJson<AuthUser>('/auth/me');
  },
};