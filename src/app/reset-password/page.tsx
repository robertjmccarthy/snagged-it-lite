'use client';

import { useState, useEffect, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Navigation from '@/components/Navigation';

// Define the form schema
const resetPasswordSchema = z
  .object({
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// Component that uses useSearchParams must be wrapped in Suspense
function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    if (!searchParams) {
      setError('Invalid or missing reset token. Please request a new password reset link.');
      return;
    }
    
    // Check if we have the necessary parameters from the reset email
    const token = searchParams.get('token');
    const access_token = searchParams.get('access_token');
    const type = searchParams.get('type');
    
    if ((token || access_token) && type === 'recovery') {
      setHasToken(true);
    } else {
      setError('Invalid or missing reset token. Please request a new password reset link.');
    }
  }, [searchParams]);

  const handlePasswordReset = async (data: ResetPasswordFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Attempting to reset password');

      // Use Supabase to update the password
      const { error } = await supabase.auth.updateUser({
        password: data.password
      });

      if (error) {
        throw new Error(error.message);
      }

      // Show success message
      setIsSuccess(true);
    } catch (err) {
      console.error('Password reset error:', err);
      setError(err instanceof Error ? err.message : 'Failed to reset password. Please try again.');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center py-12 animate-fade-in">
      <div className="container max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Create new password</h1>
          <p className="text-gray-dark">Enter a new password for your account.</p>
        </div>
        
        {isSuccess ? (
          <div className="bg-success/5 p-6 rounded-lg border border-success/10 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-success/10 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-success">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h2 className="text-lg font-semibold mb-2">Password updated successfully</h2>
            <p className="mb-6">Your password has been reset. You can now sign in with your new password.</p>
            <Link href="/signin">
              <button className="btn btn-primary rounded-pill px-6 py-2">
                Sign in
              </button>
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="rounded-md bg-error/10 p-4 border border-error/20 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-error" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <div className="text-sm text-error">{error}</div>
                  </div>
                </div>
              </div>
            )}
            
            {hasToken ? (
              <form className="space-y-6" onSubmit={handleSubmit(handlePasswordReset)}>
                <div className="space-y-2">
                  <label htmlFor="password" className="form-label">
                    New password
                  </label>
                  <input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className={`input ${formErrors.password ? 'input-error' : ''}`}
                    placeholder="••••••••"
                    {...register('password')}
                    aria-invalid={formErrors.password ? 'true' : 'false'}
                  />
                  {formErrors.password && <p className="form-error">{formErrors.password.message}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirm new password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    className={`input ${formErrors.confirmPassword ? 'input-error' : ''}`}
                    placeholder="••••••••"
                    {...register('confirmPassword')}
                    aria-invalid={formErrors.confirmPassword ? 'true' : 'false'}
                  />
                  {formErrors.confirmPassword && <p className="form-error">{formErrors.confirmPassword.message}</p>}
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn btn-primary w-full py-3 rounded-pill"
                    aria-label="Reset password"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating password...
                      </span>
                    ) : (
                      'Update password'
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center">
                <Link href="/forgot-password">
                  <button className="btn btn-primary rounded-pill px-6 py-2 mt-4">
                    Request new reset link
                  </button>
                </Link>
              </div>
            )}
            
            <div className="text-center mt-6">
              <Link href="/signin" className="text-success hover:text-success-hover transition-colors duration-200">
                Back to sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Loading fallback for the Suspense boundary
function ResetPasswordLoading() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <main className="flex min-h-screen flex-col">
      <Navigation isAuthenticated={false} />
      <Suspense fallback={<ResetPasswordLoading />}>
        <ResetPasswordContent />
      </Suspense>
    </main>
  );
}
