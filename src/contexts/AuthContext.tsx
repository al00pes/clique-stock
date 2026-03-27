import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'user';

export interface ModulePermissions {
  dashboard: boolean;
  products: boolean;
  movements: boolean;
  sales: boolean;
  reports: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: ModulePermissions;
}

interface AuthContextType {
  user: User | null;
  users: User[];
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  signup: (name: string, email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  updateUserPermissions: (userId: string, permissions: ModulePermissions) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  hasAccess: (module: keyof ModulePermissions) => boolean;
  refreshUsers: () => Promise<void>;
}

const defaultPermissions: ModulePermissions = {
  dashboard: true, products: false, movements: false, sales: false, reports: false,
};

const AuthContext = createContext<AuthContextType | null>(null);

async function fetchUserData(supabaseUser: SupabaseUser): Promise<User | null> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', supabaseUser.id)
    .maybeSingle();

  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', supabaseUser.id)
    .maybeSingle();

  const { data: permsData } = await supabase
    .from('module_permissions')
    .select('*')
    .eq('user_id', supabaseUser.id)
    .maybeSingle();

  const role = (roleData?.role as UserRole) || 'user';
  const permissions: ModulePermissions = permsData
    ? { dashboard: permsData.dashboard, products: permsData.products, movements: permsData.movements, sales: permsData.sales, reports: permsData.reports }
    : defaultPermissions;

  return {
    id: supabaseUser.id,
    name: profile?.name || supabaseUser.user_metadata?.name || '',
    email: supabaseUser.email || '',
    role,
    permissions,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async (supabaseUser: SupabaseUser | null) => {
    if (!supabaseUser) {
      setUser(null);
      setUsers([]);
      setLoading(false);
      return;
    }
    const userData = await fetchUserData(supabaseUser);
    setUser(userData);
    setLoading(false);
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        // Use setTimeout to avoid calling Supabase inside the callback synchronously
        setTimeout(() => loadUser(session.user), 0);
      } else {
        setUser(null);
        setUsers([]);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUser(session.user);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadUser]);

  // Load all users when current user is admin
  const refreshUsers = useCallback(async () => {
    if (!user || user.role !== 'admin') return;
    
    const { data: profiles } = await supabase.from('profiles').select('*');
    const { data: roles } = await supabase.from('user_roles').select('*');
    const { data: perms } = await supabase.from('module_permissions').select('*');

    if (!profiles) return;

    const allUsers: User[] = profiles.map(p => {
      const role = roles?.find(r => r.user_id === p.user_id);
      const perm = perms?.find(pm => pm.user_id === p.user_id);
      return {
        id: p.user_id,
        name: p.name,
        email: p.email,
        role: (role?.role as UserRole) || 'user',
        permissions: perm
          ? { dashboard: perm.dashboard, products: perm.products, movements: perm.movements, sales: perm.sales, reports: perm.reports }
          : defaultPermissions,
      };
    });
    setUsers(allUsers);
  }, [user]);

  useEffect(() => {
    if (user?.role === 'admin') {
      refreshUsers();
    }
  }, [user?.role, refreshUsers]);

  const login = useCallback(async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return error.message;
    return null;
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) return error.message;
    return null;
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUsers([]);
  }, []);

  const updateUserPermissions = useCallback(async (userId: string, permissions: ModulePermissions) => {
    await supabase
      .from('module_permissions')
      .update({
        dashboard: permissions.dashboard,
        products: permissions.products,
        movements: permissions.movements,
        sales: permissions.sales,
        reports: permissions.reports,
      })
      .eq('user_id', userId);

    // Update local state
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, permissions } : u));
    if (user?.id === userId) setUser(prev => prev ? { ...prev, permissions } : null);
  }, [user]);

  const deleteUser = useCallback(async (userId: string) => {
    // Delete from module_permissions and user_roles (cascade from auth.users isn't available client-side)
    await supabase.from('module_permissions').delete().eq('user_id', userId);
    await supabase.from('user_roles').delete().eq('user_id', userId);
    await supabase.from('profiles').delete().eq('user_id', userId);
    setUsers(prev => prev.filter(u => u.id !== userId));
  }, []);

  const hasAccess = useCallback((module: keyof ModulePermissions) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.permissions[module];
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, users, isAuthenticated: !!user, loading, login, signup, logout, updateUserPermissions, deleteUser, hasAccess, refreshUsers }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
