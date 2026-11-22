'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Field from '../../components/ui/Field';
import Button from '../../components/ui/Button';
import AuthLayout, { GoogleButton, OrDivider, FormAlert } from '../../components/AuthLayout';
import { login } from '../../lib/api';
import toast from 'react-hot-toast';

// The API's Google sign-in callback redirects here with ?error=<code> when it fails.
const OAUTH_ERRORS = {
  unverified_email: 'Google has not verified the email on that account, so we cannot sign you in with it. Verify it with Google, or sign in with your email and password.',
  invalid_state: 'That Google sign-in link expired or was opened in another browser. Please try again.',
  no_code: 'Google sign-in was cancelled. Please try again.',
  auth_failed: 'Google sign-in did not work this time. Please try again.',
};

// Reads the query string, so it renders inside Suspense and the rest of the page stays static.
function OAuthErrorAlert({ hidden }) {
  const message = OAUTH_ERRORS[useSearchParams().get('error')];
  return hidden ? null : <FormAlert>{message}</FormAlert>;
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = 'Enter your email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Enter an email like name@example.com';
    if (!password.trim()) newErrors.password = 'Enter your password';
    else if (password.length < 6) newErrors.password = 'Passwords are at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const loginResponse = await login(email, password);
      if (loginResponse?.error) {
        setErrors({ submit: loginResponse.error });
        setLoading(false);
        return;
      }
      toast.success('Signed in');
      setTimeout(() => {
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get('redirect');
        window.location.href = redirect && redirect.startsWith('/') ? redirect : '/dashboard';
      }, 500);
    } catch {
      setErrors({ submit: 'We could not sign you in. Check your email and password and try again.' });
      setLoading(false);
    }
  };

  const clearError = (field) => {
    if (errors[field] || errors.submit) setErrors({ ...errors, [field]: '', submit: '' });
  };

  return (
    <AuthLayout
      title="Sign in"
      description="Welcome back. Pick up where you left off."
      footer={
        <>
          New to Vaultly?{' '}
          <Link href="/signup" className="rounded-control font-medium text-brand hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <Suspense fallback={null}>
        <div className="mb-4 empty:hidden">
          <OAuthErrorAlert hidden={Boolean(errors.submit)} />
        </div>
      </Suspense>
      <GoogleButton />
      <OrDivider />

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <FormAlert>{errors.submit}</FormAlert>
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            clearError('email');
          }}
          error={errors.email}
          required
        />
        <Field
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            clearError('password');
          }}
          error={errors.password}
          required
        />
        <Button type="submit" size="lg" loading={loading} className="w-full">
          Sign in
        </Button>
      </form>
    </AuthLayout>
  );
}
