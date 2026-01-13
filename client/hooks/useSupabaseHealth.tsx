import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

interface SupabaseHealthContextType {
  isAvailable: boolean;
  isLoading: boolean;
}

const SupabaseHealthContext = createContext<SupabaseHealthContextType | undefined>(undefined);

export function SupabaseHealthProvider({ children }: { children: ReactNode }) {
  const [isAvailable, setIsAvailable] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSupabaseHealth = async () => {
      try {
        setIsLoading(true);

        // Create a promise that rejects after 5 seconds if no response
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 5000)
        );

        // Try to fetch a simple query to check if Supabase is available
        const queryPromise = (async () => {
          const { error } = await supabase
            .from('homepage_settings')
            .select('id')
            .limit(1);

          if (error) {
            throw error;
          }
          return true;
        })();

        await Promise.race([queryPromise, timeoutPromise]);
        setIsAvailable(true);
      } catch (error: any) {
        // Any error (network, timeout, etc.) means Supabase is unavailable
        console.warn('Supabase unavailable:', error?.message || String(error));
        setIsAvailable(false);
      } finally {
        setIsLoading(false);
      }
    };

    // Check on mount
    checkSupabaseHealth();

    // Retry every 10 seconds if unavailable
    const interval = setInterval(() => {
      checkSupabaseHealth();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <SupabaseHealthContext.Provider value={{ isAvailable, isLoading }}>
      {children}
    </SupabaseHealthContext.Provider>
  );
}

export function useSupabaseHealth() {
  const context = useContext(SupabaseHealthContext);
  if (context === undefined) {
    throw new Error('useSupabaseHealth must be used within SupabaseHealthProvider');
  }
  return context;
}
