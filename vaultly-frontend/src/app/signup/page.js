'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Circle } from 'lucide-react';
import Field from '../../components/ui/Field';
import Button from '../../components/ui/Button';
import AuthLayout, { GoogleButton, OrDivider, FormAlert } from '../../components/AuthLayout';
import { signup, login } from '../../lib/api';
import toast from 'react-hot-toast';

const PASSWORD_RULES = [
  { id: 'length', label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { id: 'lower', label: 'A lowercase letter', test: (p) => /[a-z]/.test(p) },
  { id: 'upper', label: 'An uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { id: 'number', label: 'A number', test: (p) => /\d/.test(p) },
];

export default function SignupPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!firstName.trim()) newErrors.firstName = 'Enter your first name';
    if (!lastName.trim()) newErrors.lastName = 'Enter your last name';
    if (!email.trim()) newErrors.email = 'Enter your email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Enter an email like name@example.com';
    if (!PASSWORD_RULES.every((rule) => rule.test(password))) newErrors.password = 'Your password needs everything in the list below';
    if (!confirmPassword.trim()) newErrors.confirmPassword = 'Enter your password again';
    else if (password !== confirmPassword) newErrors.confirmPassword = 'The two passwords do not match';
    if (!agreedToTerms) newErrors.terms = 'Tick the box to continue';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const userData = {
        full_name: `${firstName.trim()} ${lastName.trim()}`,
        email: email.trim(),
        password
      };

      const signupResponse = await signup(userData);
      if (signupResponse?.error) {
        setErrors({ submit: signupResponse.error });
        setLoading(false);
        return;
      }

      const loginResponse = await login(email, password);
      if (loginResponse?.error) {
        setErrors({ submit: loginResponse.error });
        setLoading(false);
        return;
      }

      toast.success('Account created');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 500);
    } catch {
      setErrors({ submit: 'We could not create your account. Please try again.' });
      setLoading(false);
    }
  };

  const update = (setter, field) => (e) => {
    setter(e.target.value);
    if (errors[field] || errors.submit) setErrors({ ...errors, [field]: '', submit: '' });
  };

  return (
    <AuthLayout
      title="Create your account"
      description="Free, and takes about a minute."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="rounded-control font-medium text-brand hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <GoogleButton />
      <OrDivider />

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <FormAlert>{errors.submit}</FormAlert>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="First name" autoComplete="given-name" value={firstName} onChange={update(setFirstName, 'firstName')} error={errors.firstName} required />
          <Field label="Last name" autoComplete="family-name" value={lastName} onChange={update(setLastName, 'lastName')} error={errors.lastName} required />
        </div>
        <Field label="Email" type="email" autoComplete="email" value={email} onChange={update(setEmail, 'email')} error={errors.email} required />

        <div>
          <Field
            label="Password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={update(setPassword, 'password')}
            error={errors.password}
            aria-describedby="password-rules"
            required
          />
          {/* Shown from the start and updated while typing, so the rules are never a surprise. */}
          <ul id="password-rules" className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1" aria-label="Password requirements">
            {PASSWORD_RULES.map((rule) => {
              const met = rule.test(password);
              return (
                <li key={rule.id} className={`flex items-center gap-1.5 text-ui ${met ? 'text-positive' : 'text-ink-3'}`}>
                  {met ? <Check size={14} aria-hidden="true" /> : <Circle size={6} className="mx-1 fill-current" aria-hidden="true" />}
                  {rule.label}
                  <span className="sr-only">{met ? '(done)' : '(not yet)'}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <Field
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={update(setConfirmPassword, 'confirmPassword')}
          error={errors.confirmPassword}
          required
        />

        <div>
          <label className="flex items-start gap-3 text-ui text-ink-2">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => {
                setAgreedToTerms(e.target.checked);
                if (errors.terms) setErrors({ ...errors, terms: '' });
              }}
              aria-invalid={errors.terms ? true : undefined}
              aria-describedby={errors.terms ? 'terms-error' : undefined}
              className="mt-0.5 h-5 w-5 shrink-0 rounded border-line-strong accent-brand"
            />
            I accept the terms of service and agree to Vaultly storing my data to run my account.
          </label>
          {errors.terms && <p id="terms-error" className="mt-1.5 text-ui text-negative">{errors.terms}</p>}
        </div>

        <Button type="submit" size="lg" loading={loading} className="w-full">
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}
