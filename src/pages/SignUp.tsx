import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { supabase } from "../lib/supabase";

export function SignUp() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSignUp = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Password and confirm password do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username: username } }
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      console.log('Sign up successful:', data);

      if (data.session) {
        navigate('/');
      } else {
        setIsSubmitted(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-950 p-4">
      <div className="w-full max-w-md p-6 rounded-xl border border-gray-800 bg-gray-900 shadow-xl space-y-4">

        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold text-gray-100">
            {isSubmitted ? 'Check your email' : 'Create an account'}
          </h1>
          <p className="text-sm font-medium text-gray-400">
            {isSubmitted
              ? `We sent a confirmation link to ${email}`
              : 'Create a new Raidor account'}
          </p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg">
            {error}
          </div>
        )}

        {!isSubmitted ? (
          <form onSubmit={handleSignUp} className="flex flex-col gap-y-3">
            <div>
              <label className="text-sm font-medium text-gray-400">Username</label>
              <Input
                placeholder="jhondoe"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-400">Email Address</label>
              <Input
                placeholder="you@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
        ) : (
          <div className="text-center pt-2 space-y-4">
            <p className="text-sm text-gray-300">
              Please click the link sent to your inbox to confirm your email address and activate your account.
            </p>
            <Link to="/login">
              <Button className="w-full">Go to Login</Button>
            </Link>
          </div>
        )}

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
