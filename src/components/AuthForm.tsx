'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Button } from '@/components';

// Form validation schema
const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signUpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type SignInFormData = z.infer<typeof signInSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;

interface AuthFormProps {
  type: 'signin' | 'signup';
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export default function AuthForm({ type, onSubmit, isLoading, error }: AuthFormProps) {
  const isSignUp = type === 'signup';
  const schema = isSignUp ? signUpSchema : signInSchema;
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: isSignUp 
      ? { email: '', password: '', confirmPassword: '' } 
      : { email: '', password: '' },
  });
  
  // Type assertion for errors based on form type
  const formErrors = errors as typeof errors & {
    email?: { message?: string };
    password?: { message?: string };
    confirmPassword?: { message?: string };
  };

  return (
    <div className="w-full space-y-6">
      {!isSignUp && (
        <p className="text-left text-sm text-gray-dark">
          New to SnaggedIt?{' '}
          <Link
            href="/signup"
          >
            Sign up
          </Link>
        </p>
      )}
      
      {isSignUp && (
        <p className="text-left text-sm text-gray-dark">
          Already have an account?{' '}
          <Link
            href="/signin"
          >
            Sign in
          </Link>
        </p>
      )}

      <hr className="my-6 border-gray-200" aria-hidden="true" />
      
      {error && (
        <div className="rounded-md bg-error/10 p-4 border border-error/20">
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

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-3">


          <div className="space-y-2">
            <label htmlFor="email" className="form-label">
              Your email address
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

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="form-label">
                Your password
              </label>
            </div>
            {isSignUp && (
              <p className="text-xs text-gray-500 mb-1">Password must be at least 6 characters long</p>
            )}
            <input
              id="password"
              type="password"
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              required
              className={`input ${formErrors.password ? 'input-error' : ''}`}
              placeholder="••••••••"
              {...register('password')}
              aria-invalid={formErrors.password ? 'true' : 'false'}
            />
            {formErrors.password && <p className="form-error">{formErrors.password.message}</p>}
          </div>

          {isSignUp && (
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm your password
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
              {formErrors.confirmPassword && (
                <p className="form-error">{formErrors.confirmPassword.message}</p>
              )}
            </div>
          )}
        </div>

        <div className="pt-2 flex flex-col items-start">
          <Button 
            type="submit" 
            variant="primary" 
            size="md" 
            className="w-auto" 
            disabled={isLoading}
            aria-label={isSignUp ? 'Sign up' : 'Sign in'}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isSignUp ? 'Creating account...' : 'Signing in...'}
              </span>
            ) : (
              <>{isSignUp ? 'Sign up' : 'Sign in'}</>
            )}
          </Button>
          
          {!isSignUp && (
            <>
              <hr className="mt-8 mb-4 w-full border-gray-200" aria-hidden="true" />
              <div className="text-sm">
                <Link
                  href="/forgot-password"
                >
                  Forgot password?
                </Link>
              </div>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
