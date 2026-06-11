import { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';

/**
 * Chame este hook no topo de qualquer tela de admin.
 * Se o usuário não for ADMIN, redireciona para /(app)/filmes imediatamente.
 */
export function useAdminGuard() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== 'ADMIN') {
      router.replace('/(app)/filmes');
    }
  }, [user, loading]);

  return { isAdmin: user?.role === 'ADMIN', loading };
}
