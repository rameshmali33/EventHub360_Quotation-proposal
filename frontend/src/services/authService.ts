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

  requestPasswordReset(email: string) {
    return fetchJson<{ message: string; resetToken?: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword(token: string, password: string) {
    return fetchJson<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  },

  listUsers() {
    return fetchJson<AuthUser[]>('/auth/users');
  },

  assignRole(userId: number, role: string) {
    return fetchJson<AuthUser>('/auth/users/' + userId + '/role', {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  },
};