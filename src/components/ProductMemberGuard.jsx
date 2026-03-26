import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

export default function ProductMemberGuard({ children }) {
  const { loading, user, isVerifiedProductMember } = useAuth();

  if (loading) {
    return <div className="min-h-screen pt-36 px-6 max-w-5xl mx-auto">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isVerifiedProductMember) {
    return <Navigate to="/activate" replace />;
  }

  return children;
}
