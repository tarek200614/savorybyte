import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/store/useAuth';
import { Token } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Lock } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setErrorMessage(null);
    setLoading(true);

    try {
      // Form URL encoded data for OAuth2 password spec
      const formData = new URLSearchParams();
      formData.append('username', data.email);
      formData.append('password', data.password);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData,
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Invalid email or password');
      }

      const tokenData: Token = await res.json();
      login(tokenData.access_token, tokenData.user);

      if (tokenData.user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (tokenData.user.role === 'STAFF') {
        navigate('/staff/dashboard');
      } else {
        navigate('/reservations/book');
      }
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-extrabold bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
            Welcome Back
          </CardTitle>
          <p className="text-sm text-slate-400 font-light">
            Sign in to manage your dining reservations and food orders
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium text-center">
                {errorMessage}
              </div>
            )}

            <Input
              label="Email Address"
              type="email"
              placeholder="customer@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full font-bold py-3 mt-2"
              loading={loading}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400 border-t border-slate-800/80 pt-4">
            Don't have an account yet?{' '}
            <Link
              to="/register"
              className="text-amber-400 font-semibold hover:underline"
            >
              Create Account
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
