import { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "../components/Input";
import { Button } from "../components/Button";

export function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Logging in with:', { phone, password });
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-950">
      <div className="max-w-md p-6 rounded-lg border border-gray-800 bg-gray-900">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold text-gray-100">Welcome back!</h1>
          <p className="text-sm font-medium text-gray-400">Log in to your Raidor account</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-y-3 mt-4">
          <div>
            <label className="text-sm font-medium text-gray-400">Phone Number</label>
            <Input placeholder="+1234567890" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
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

          <Button type="submit" className="w-full mt-3">
            Log In
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
