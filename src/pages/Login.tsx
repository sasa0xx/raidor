import { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { supabase } from "../lib/supabase"

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password })
      if (loginError) {
        setError(loginError.message);
        return;
      }

      console.log(data)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-950">
      <div className="max-w-md p-6 rounded-lg border border-gray-800 bg-gray-900">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold text-gray-100">Welcome back!</h1>
          <p className="text-sm font-medium text-gray-400">Log in to your Raidor account</p>
        </div>

        {error && (
          <div>
            <p className="p-3 border rounded-lg text-sm text-red-400 bg-red-500/10 border-red-500/20">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-y-3 mt-4">
          <div>
            <label className="text-sm font-medium text-gray-400">Email</label>
            <Input placeholder="you@example.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-400">Password</label>
            <Input
              placeholder="***********"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required />
          </div>

          <Button type="submit" className="w-full mt-3" disabled={isLoading}>
            {isLoading ? 'Loading account...' : 'Login'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-4">
          Don't have an account?{' '}
          <Link to="/signup" className="text-violet-400 hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
