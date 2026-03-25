import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export interface ClientProfile {
  id: string;
  username: string | null;
  email: string | null;
}

interface AdminContextType {
  isAdmin: boolean;
  allClients: ClientProfile[];
  selectedUserIds: string[];
  setSelectedUserIds: (ids: string[]) => void;
  effectiveUserIds: string[] | null;
}

const AdminContext = createContext<AdminContextType | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const { role, user } = useAuth();
  const isAdmin = role === 'admin';

  const [allClients, setAllClients] = useState<ClientProfile[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  useEffect(() => {
    if (!isAdmin) return;
    supabase
      .from('profiles')
      .select('id, username, email')
      .order('username', { ascending: true })
      .then(({ data }) => {
        if (data) setAllClients(data as ClientProfile[]);
      });
  }, [isAdmin]);

  const effectiveUserIds: string[] | null = isAdmin
    ? selectedUserIds.length === 0
      ? null
      : selectedUserIds
    : user
    ? [user.id]
    : null;

  return (
    <AdminContext.Provider value={{ isAdmin, allClients, selectedUserIds, setSelectedUserIds, effectiveUserIds }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin(): AdminContextType {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
}
