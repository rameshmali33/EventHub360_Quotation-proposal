import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authService, type AuthSession, type AuthUser } from '../services/authService';

interface SignUpPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  organizationName: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (payload: SignUpPayload) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const saveSession = (session: AuthSession) => {
  localStorage.setItem('eventhub_access_token', session.accessToken);
  localStorage.setItem('user_id', String(session.user.id));
  localStorage.setItem('tenant_id', String(session.user.tenantId));
  localStorage.setItem('user_first_name', session.user.firstName);
  localStorage.setItem('user_last_name', session.user.lastName);
  localStorage.setItem('user_email', session.user.email);
  localStorage.setItem('user_role', session.user.role);
  localStorage.setItem('organization_name', session.user.organizationName);
  window.dispatchEvent(new Event('profile-updated'));
};

const clearSession = () => {
  [
    'eventhub_access_token',
    'user_id',
    'tenant_id',
    'user_first_name',
    'user_last_name',
    'user_email',
    'user_role',
    'organization_name',
    'user_avatar_url',
  ].forEach((key) => localStorage.removeItem(key));
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const signOut = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  useEffect(() => {
    const restoreSession = async () => {
      if (!localStorage.getItem('eventhub_access_token')) {
        setLoading(false);
        return;
      }
      try {
        const profile = await authService.getProfile();
        setUser(profile);
        saveSession({ accessToken: localStorage.getItem('eventhub_access_token') || '', user: profile });
      } catch {
        clearSession();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const signIn = async (email: string, password: string) => {
    const session = await authService.signIn(email, password);
    saveSession(session);
    setUser(session.user);
  };

  const signUp = async (payload: SignUpPayload) => {
    const session = await authService.signUp(payload);
    saveSession(session);
    setUser(session.user);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};