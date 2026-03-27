import React, { createContext, useContext, useState, useCallback } from 'react';

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
  login: (email: string, password: string) => boolean;
  signup: (name: string, email: string, password: string) => boolean;
  logout: () => void;
  updateUserPermissions: (userId: string, permissions: ModulePermissions) => void;
  addUser: (user: Omit<User, 'id'>) => void;
  deleteUser: (userId: string) => void;
  hasAccess: (module: keyof ModulePermissions) => boolean;
}

const defaultAdminPermissions: ModulePermissions = {
  dashboard: true, products: true, movements: true, reports: true,
};

const mockUsers: (User & { password: string })[] = [
  {
    id: '1', name: 'Admin', email: 'admin@estoque.com', password: 'admin123',
    role: 'admin', permissions: defaultAdminPermissions,
  },
  {
    id: '2', name: 'Maria Silva', email: 'maria@estoque.com', password: 'user123',
    role: 'user', permissions: { dashboard: true, products: true, movements: false, reports: false },
  },
];

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [usersDB, setUsersDB] = useState(mockUsers);

  const login = useCallback((email: string, password: string) => {
    const found = usersDB.find(u => u.email === email && u.password === password);
    if (found) {
      const { password: _, ...userData } = found;
      setUser(userData);
      return true;
    }
    return false;
  }, [usersDB]);

  const signup = useCallback((name: string, email: string, password: string) => {
    if (usersDB.find(u => u.email === email)) return false;
    const newUser = {
      id: crypto.randomUUID(), name, email, password,
      role: 'user' as UserRole,
      permissions: { dashboard: true, products: false, movements: false, reports: false },
    };
    setUsersDB(prev => [...prev, newUser]);
    const { password: _, ...userData } = newUser;
    setUser(userData);
    return true;
  }, [usersDB]);

  const logout = useCallback(() => setUser(null), []);

  const updateUserPermissions = useCallback((userId: string, permissions: ModulePermissions) => {
    setUsersDB(prev => prev.map(u => u.id === userId ? { ...u, permissions } : u));
    if (user?.id === userId) setUser(prev => prev ? { ...prev, permissions } : null);
  }, [user]);

  const addUser = useCallback((userData: Omit<User, 'id'>) => {
    const newUser = { ...userData, id: crypto.randomUUID(), password: 'temp123' };
    setUsersDB(prev => [...prev, newUser]);
  }, []);

  const deleteUser = useCallback((userId: string) => {
    setUsersDB(prev => prev.filter(u => u.id !== userId));
  }, []);

  const hasAccess = useCallback((module: keyof ModulePermissions) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.permissions[module];
  }, [user]);

  const users = usersDB.map(({ password: _, ...u }) => u);

  return (
    <AuthContext.Provider value={{ user, users, isAuthenticated: !!user, login, signup, logout, updateUserPermissions, addUser, deleteUser, hasAccess }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
