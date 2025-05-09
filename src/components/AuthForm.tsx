'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';

// Form validation schema
const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signUpSchema = z.object({
  fullName: z.string().min(2, 'Full name is required').optional(),
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
      ? { fullName: '', email: '', password: '', confirmPassword: '' } 
      : { email: '', password: '' },
  });
  
  // Type assertion for errors based on form type
  const formErrors = errors as typeof errors & {
    fullName?: { message?: string };
    email?: { message?: string };
    password?: { message?: string };
    confirmPassword?: { message?: string };
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          {isSignUp ? 'Create your account' : 'Sign in to your account'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <Link
            href={isSignUp ? '/signin' : '/signup'}
            className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
          >
            {isSignUp ? 'Sign in' : 'Sign up'}
          </Link>
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-error/10 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-error" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-error">Authentication error</h3>
              <div className="mt-2 text-sm text-error">{error}</div>
            </div>
          </div>
        </div>
      )}

      <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4 rounded-md">
          {isSignUp && (
            <div>
              <label htmlFor="fullName" className="form-label">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                autoComplete="name"
                className={`input ${formErrors.fullName ? 'input-error' : ''}`}
                placeholder="Full name"
                {...register('fullName')}
                aria-invalid={formErrors.fullName ? 'true' : 'false'}
              />
              {formErrors.fullName && <p className="form-error">{formErrors.fullName.message}</p>}
            </div>
          )}

          <div>
            <label htmlFor="email" className="form-label">
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              className={`input ${formErrors.email ? 'input-error' : ''}`}
              placeholder="Email address"
              {...register('email')}
              aria-invalid={formErrors.email ? 'true' : 'false'}
            />
            {formErrors.email && <p className="form-error">{formErrors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              required
              className={`input ${formErrors.password ? 'input-error' : ''}`}
              placeholder="Password"
              {...register('password')}
              aria-invalid={formErrors.password ? 'true' : 'false'}
            />
            {formErrors.password && <p className="form-error">{formErrors.password.message}</p>}
          </div>

          {isSignUp && (
            <div>
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className={`input ${formErrors.confirmPassword ? 'input-error' : ''}`}
                placeholder="Confirm password"
                {...register('confirmPassword')}
                aria-invalid={formErrors.confirmPassword ? 'true' : 'false'}
              />
              {formErrors.confirmPassword && (
                <p className="form-error">{formErrors.confirmPassword.message}</p>
              )}
            </div>
          )}
        </div>

        {!isSignUp && (
          <div className="flex items-center justify-end">
            <div className="text-sm">
              <Link
                href="/forgot-password"
                className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Forgot your password?
              </Link>
            </div>
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary w-full"
            aria-label={isSignUp ? 'Sign up' : 'Sign in'}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isSignUp ? 'Creating account...' : 'Signing in...'}
              </span>
            ) : (
              <>{isSignUp ? 'Sign up' : 'Sign in'}</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
