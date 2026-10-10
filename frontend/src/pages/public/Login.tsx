import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/store/useAuth';
import { useTranslation } from '@/i18n/LanguageContext';
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
  const { t } = useTranslation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
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
      setErrorMessage((err as Error).message || t.common.error);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (email: string, pass: string) => {
    setValue('email', email);
    setValue('password', pass);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-champagne/15 bg-charcoal shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-midnight border border-champagne/20 flex items-center justify-center text-champagne mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-serif font-bold text-ivory">
            {t.auth.signInTitle}
          </CardTitle>
          <p className="text-sm text-stone-400 font-light">
            {t.auth.signInSubtitle}
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-midnight border border-terracotta/30 text-terracotta-light text-sm font-medium text-center">
                {errorMessage}
              </div>
            )}

            <Input
              label={t.auth.emailLabel}
              type="email"
              placeholder="e.g. customer@savorybyte.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label={t.auth.passwordLabel}
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full font-semibold shadow-md shadow-saffron/20"
              loading={loading}
            >
              {t.auth.signInBtn}
            </Button>

            <div className="text-center pt-2">
              <p className="text-xs text-stone-400">
                <Link
                  to="/register"
                  className="font-semibold text-champagne hover:underline"
                >
                  {t.auth.noAccountPrompt}
                </Link>
              </p>
            </div>
          </form>

          {/* Demo Logins Info */}
          <div className="mt-6 pt-4 border-t border-champagne/15 space-y-2 text-[11px] text-stone-400 font-mono">
            <p className="font-semibold text-stone-300">{t.auth.quickDemoAccounts}:</p>
            <div className="grid grid-cols-1 gap-1 text-[11px]">
              <button
                type="button"
                onClick={() => fillDemo('admin@savorybyte.com', 'AdminSecret123!')}
                className="text-left rtl:text-right hover:text-champagne transition flex items-center justify-between"
              >
                <span>Admin: admin@savorybyte.com</span>
                <span className="text-stone-500">AdminSecret123!</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('staff@savorybyte.com', 'StaffSecret123!')}
                className="text-left rtl:text-right hover:text-champagne transition flex items-center justify-between"
              >
                <span>Staff: staff@savorybyte.com</span>
                <span className="text-stone-500">StaffSecret123!</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('customer@savorybyte.com', 'CustomerSecret123!')}
                className="text-left rtl:text-right hover:text-champagne transition flex items-center justify-between"
              >
                <span>Customer: customer@savorybyte.com</span>
                <span className="text-stone-500">CustomerSecret123!</span>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
