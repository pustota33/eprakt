import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

export interface AdminAuthContextType {
  adminId: string | null;
  email: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateCredentials: (currentPassword: string, newEmail: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminId, setAdminId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const checkAuth = useCallback(async () => {
    try {
      const stored = localStorage.getItem('admin_auth');
      if (stored) {
        const { adminId: aId, email: em } = JSON.parse(stored);
        setAdminId(aId);
        setEmail(em);
      }
    } catch (error) {
      console.error('Admin auth check failed:', error);
      localStorage.removeItem('admin_auth');
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

      const { data, error } = await supabase
        .from('admin')
        .select('id, email, password_hash')
        .eq('email', email)
        .single();

      if (error || !data) {
        return { success: false, error: 'Администратор не найден' };
      }

      // Verify password (simple comparison for now)
      if (data.password_hash !== password) {
        return { success: false, error: 'Неверный пароль' };
      }

      localStorage.setItem('admin_auth', JSON.stringify({
        adminId: data.id,
        email: data.email,
      }));

      setAdminId(data.id);
      setEmail(data.email);
      return { success: true };
    } catch (error) {
      console.error('Admin login failed:', error);
      return { success: false, error: 'Ошибка при входе' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem('admin_auth');
    setAdminId(null);
    setEmail(null);
    navigate('/admin-login');
  }, [navigate]);

  const updateCredentials = useCallback(async (currentPassword: string, newEmail: string, newPassword: string) => {
    try {
      if (!adminId) {
        return { success: false, error: 'Не авторизован' };
      }

      // Verify current password
      const { data, error: selectError } = await supabase
        .from('admin')
        .select('password_hash')
        .eq('id', adminId)
        .single();

      if (selectError || !data) {
        return { success: false, error: 'Не удалось получить текущие данные' };
      }

      if (data.password_hash !== currentPassword) {
        return { success: false, error: 'Неверный текущий пароль' };
      }

      // Update credentials
      const { error: updateError } = await supabase
        .from('admin')
        .update({
          email: newEmail,
          password_hash: newPassword,
        })
        .eq('id', adminId);

      if (updateError) {
        if (updateError.message.includes('duplicate')) {
          return { success: false, error: 'Этот email уже используется' };
        }
        return { success: false, error: 'Ошибка при обновлении данных' };
      }

      // Update local state
      localStorage.setItem('admin_auth', JSON.stringify({
        adminId: adminId,
        email: newEmail,
      }));
      setEmail(newEmail);

      return { success: true };
    } catch (error) {
      console.error('Admin credentials update failed:', error);
      return { success: false, error: 'Ошибка при обновлении' };
    }
  }, [adminId]);

  const value: AdminAuthContextType = {
    adminId,
    email,
    isLoading,
    isAuthenticated: !!adminId,
    login,
    logout,
    checkAuth,
    updateCredentials,
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};
