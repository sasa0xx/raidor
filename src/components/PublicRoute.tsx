import { Navigate, type Navigation } from "react-router-dom";
import { useAuth } from "../context/AuthContext"

export function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 text-gray-400">
        Loading...
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
