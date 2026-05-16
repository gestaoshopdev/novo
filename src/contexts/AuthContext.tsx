import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        // Criar uma promise de timeout para não travar a aplicação
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Timeout ao conectar com Supabase")), 8000)
        );

        const sessionPromise = supabase.auth.getSession();

        // Race entre a sessão e o timeout
        const { data: { session } } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any;

        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error("[AuthContext] Erro ou timeout ao buscar sessão inicial:", error);
        // Em caso de erro/timeout, permitimos que a aplicação carregue (provavelmente cairá no login)
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Escutar por mudanças de autenticação (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
