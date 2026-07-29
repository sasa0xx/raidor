import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { supabase } from "../lib/supabase";

export function SignUp() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'signup' | 'verify'>('signup');

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
      setStep('verify');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({ phone, token: otp, type: 'sms' });
      if (verifyError) {
        setError(verifyError.message);
        return;
      }
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-950 p-4">
      <div className="w-full max-w-md p-6 rounded-xl border border-gray-800 bg-gray-900 shadow-xl space-y-4">

        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold text-gray-100">
            {step === 'signup' ? 'Create an account' : 'Verify Phone Number'}
          </h1>
          <p className="text-sm font-medium text-gray-400">
            {step === 'signup' ? 'Create a new Raidor account' : `Enter the 6-digit code sent to ${phone}`}
          </p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg">
            {error}
          </div>
        )}

        {step === 'signup' ? (
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
        ) : (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-y-3">
            <div>
              <label className="text-sm font-medium text-gray-400">6-Digit Code</label>
              <Input
                placeholder="123456"
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full mt-3" disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </Button>

            <button
              type="button"
              onClick={() => setStep('signup')}
              className="text-xs text-gray-400 hover:underline mt-2"
            >
              ← Back to Sign Up
            </button>
          </form>
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
