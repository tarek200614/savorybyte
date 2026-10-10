import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/services/api';
import { User } from '@/types';
import { useTranslation } from '@/i18n/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { UserPlus } from 'lucide-react';

const registerSchema = z
  .object({
    full_name: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().optional(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm_password: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export function Register() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setErrorMessage(null);
    setLoading(true);

    try {
      await apiRequest<User>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          full_name: data.full_name,
          phone: data.phone || null,
        }),
      });

      navigate('/login');
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || t.common.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-champagne/15 bg-charcoal shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-midnight border border-champagne/20 flex items-center justify-center text-champagne mx-auto">
            <UserPlus className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-serif font-bold text-ivory">
            {t.auth.registerTitle}
          </CardTitle>
          <p className="text-sm text-stone-400 font-light">
            {t.auth.registerSubtitle}
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
              label={t.auth.fullNameLabel}
              placeholder="e.g. Sophia Montgomery"
              error={errors.full_name?.message}
              {...register('full_name')}
            />

            <Input
              label={t.auth.emailLabel}
              type="email"
              placeholder="e.g. customer@savorybyte.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label={t.auth.phoneLabel}
              type="tel"
              placeholder="+1 (555) 123-4567"
              error={errors.phone?.message}
              {...register('phone')}
            />

            <Input
              label={`${t.auth.passwordLabel} (min. 8 chars)`}
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              error={errors.confirm_password?.message}
              {...register('confirm_password')}
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full font-semibold shadow-md shadow-saffron/20"
              loading={loading}
            >
              {t.auth.registerBtn}
            </Button>

            <div className="text-center pt-2">
              <p className="text-xs text-stone-400">
                <Link to="/login" className="font-semibold text-champagne hover:underline">
                  {t.auth.haveAccountPrompt}
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
