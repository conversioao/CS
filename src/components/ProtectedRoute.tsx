import { useSession } from '@/contexts/SessionContext';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = () => {
  const { session, loading, profile } = useSession();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Se a sessão existe, mas o perfil ainda está carregando, mostre o loader.
  if (!profile) {
     return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  // Se o usuário NÃO está verificado e tenta acessar qualquer página protegida...
  if (profile.status !== 'verified') {
    // ...exceto a própria página de verificação, redirecione-o para /verify.
    if (location.pathname !== '/verify') {
      return <Navigate to="/verify" replace />;
    }
  }

  // Se o usuário ESTÁ verificado e tenta acessar a página de verificação...
  if (profile.status === 'verified' && location.pathname === '/verify') {
    // ...redirecione-o para o painel principal.
    return <Navigate to="/dashboard" replace />;
  }

  // Se nenhuma das condições acima for atendida, permita o acesso à rota solicitada.
  return <Outlet />;
};

export default ProtectedRoute;