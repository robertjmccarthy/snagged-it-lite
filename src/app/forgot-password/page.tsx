'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import Navigation from '@/components/Navigation';

// Define the form schema
const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const handleResetPassword = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Attempting to send password reset email to:', data.email);

      // Use Supabase to send a password reset email
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw new Error(error.message);
      }

      // Show success message
      setIsSuccess(true);
    } catch (err) {
      console.error('Password reset error:', err);
      setError(err instanceof Error ? err.message : 'Failed to send reset email. Please try again.');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col">
      <Navigation isAuthenticated={false} />
      
      <div className="flex flex-1 flex-col items-center justify-center py-12 animate-fade-in">
        <div className="container max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Reset your password</h1>
            <p className="text-gray-dark">Enter your email address and we'll send you instructions to reset your password.</p>
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
              <h2 className="text-lg font-semibold mb-2">Check your inbox</h2>
              <p className="mb-6">We've sent password reset instructions to your email address.</p>
              <Link href="/signin">
                <button className="btn btn-primary rounded-pill px-6 py-2">
                  Return to sign in
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
              
              <form className="space-y-6" onSubmit={handleSubmit(handleResetPassword)}>
                <div className="space-y-2">
                  <label htmlFor="email" className="form-label">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    className={`input ${formErrors.email ? 'input-error' : ''}`}
                    placeholder="you@example.com"
                    {...register('email')}
                    aria-invalid={formErrors.email ? 'true' : 'false'}
                  />
                  {formErrors.email && <p className="form-error">{formErrors.email.message}</p>}
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
                        Sending reset link...
                      </span>
                    ) : (
                      'Reset password'
                    )}
                  </button>
                </div>
                
                <div className="text-center mt-4">
                  <Link href="/signin" className="text-success hover:text-success-hover transition-colors duration-200">
                    Back to sign in
                  </Link>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
