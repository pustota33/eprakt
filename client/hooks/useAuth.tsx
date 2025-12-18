import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

export interface AuthContextType {
  facilitatorId: string | null;
  email: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [facilitatorId, setFacilitatorId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const checkAuth = useCallback(async () => {
    try {
      const stored = localStorage.getItem('facilitator_auth');
      if (stored) {
        const { facilitatorId: fId, email: em } = JSON.parse(stored);
        setFacilitatorId(fId);
        setEmail(em);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('facilitator_auth');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);

      console.log('Attempting login for email:', email);

      // Fetch facilitator with their password hash
      const { data, error } = await supabase
        .from('facilitators')
        .select('id, email, password_hash')
        .eq('email', email)
        .single();

      if (error || !data) {
        console.error('Facilitator not found:', error);
        return { success: false, error: 'Пользователь не найден' };
      }

      console.log('Facilitator found:', data.email);

      // Compare password
      if (data.password_hash !== password) {
        console.error('Password mismatch for email:', email);
        return { success: false, error: 'Неверный пароль' };
      }

      // Store auth info in localStorage
      localStorage.setItem('facilitator_auth', JSON.stringify({
        facilitatorId: data.id,
        email: data.email,
      }));

      setFacilitatorId(data.id);
      setEmail(data.email);
      console.log('Login successful for:', email);
      return { success: true };
    } catch (error) {
      console.error('Login failed with exception:', error);
      return { success: false, error: 'Ошибка при входе' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem('facilitator_auth');
    setFacilitatorId(null);
    setEmail(null);
    navigate('/login');
  }, [navigate]);

  const value: AuthContextType = {
    facilitatorId,
    email,
    isLoading,
    isAuthenticated: !!facilitatorId,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
