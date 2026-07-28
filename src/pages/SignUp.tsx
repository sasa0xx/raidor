import { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { supabase } from "../lib/supabase";

export function SignUp() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Password and confirm password do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        phone,
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      console.log('Sign up successful:', data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-950 p-4">
      <div className="w-full max-w-md p-6 rounded-xl border border-gray-800 bg-gray-900 shadow-xl space-y-4">

        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold text-gray-100">Create an account</h1>
          <p className="text-sm font-medium text-gray-400">Create a new Raidor account</p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSignUp} className="flex flex-col gap-y-3">
          <div>
            <label className="text-sm font-medium text-gray-400">Phone Number</label>
            <Input
              placeholder="+1234567890"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-400">Password</label>
            <Input
              placeholder="***********"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-400">Confirm Password</label>
            <Input
              placeholder="***********"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full mt-3" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-violet-400 hover:underline font-medium">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
