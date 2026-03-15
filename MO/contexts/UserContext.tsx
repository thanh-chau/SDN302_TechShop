import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getStoredUser, setStoredUser } from '@/utils/api';

export interface StoredUser {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  phone?: string;
  address?: string;
  token: string;
}

interface UserContextType {
  user: StoredUser | null;
  setUser: (user: StoredUser | null) => Promise<void>;
  loading: boolean;
}

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: async () => {},
  loading: true,
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<StoredUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const stored = await getStoredUser();
      if (stored?.token && stored?.id) {
        setUserState(stored as StoredUser);
      }
      setLoading(false);
    })();
  }, []);

  const setUser = useCallback(async (u: StoredUser | null) => {
    setUserState(u);
    await setStoredUser(u);
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
