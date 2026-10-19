'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Wallet2, Eye, EyeOff } from 'lucide-react';
import FormInput from '../../components/FormInput';
import { signup, login, API_BASE_URL } from '../../lib/api';
import toast, { Toaster } from 'react-hot-toast';

export default function SignupPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleGoogleSignup = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email format';
    if (!password.trim()) newErrors.password = 'Password is required';
    else if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) 
      newErrors.password = 'Must contain uppercase, lowercase, and numeric characters';
    if (!confirmPassword.trim()) newErrors.confirmPassword = 'Confirmation required';
    else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!agreedToTerms) newErrors.terms = 'Agreement required';
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

      toast.success('Account created successfully');
      const loginResponse = await login(email, password);
      if (loginResponse?.error) {
        setErrors({ submit: loginResponse.error });
        toast.error(loginResponse.error);
        setLoading(false);
        return;
      }
      
      toast.success('Redirecting to dashboard...');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 500);
    } catch (err) {
      setErrors({ submit: 'Signup failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-slate-50/60 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          {/* Brand Header */}
          <div className="flex flex-col items-center text-center space-y-2">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
                <Wallet2 size={20} strokeWidth={2.2} className="text-teal-400" />
              </div>
              <span className="text-2xl font-bold text-slate-900 tracking-tight">Vaultly</span>
            </Link>
            <p className="text-xs text-slate-500 font-medium">Personal & Shared Financial Management</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-8 space-y-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Create your account</h2>
              <p className="text-xs text-slate-500 mt-0.5">Start tracking and collaborating today</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <FormInput
                  label="First Name"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    if (errors.firstName) setErrors({ ...errors, firstName: '' });
                  }}
                  error={errors.firstName}
                  required
                />
                <FormInput
                  label="Last Name"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    if (errors.lastName) setErrors({ ...errors, lastName: '' });
                  }}
                  error={errors.lastName}
                  required
                />
              </div>

              <FormInput
                label="Email Address"
                type="email"
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
                error={errors.email}
                required
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors({ ...errors, password: '' });
                    }}
                    required
                    className={`w-full px-3.5 py-2.5 rounded-xl border bg-slate-50/50 text-slate-900 text-sm focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15 transition placeholder:text-slate-400 ${
                      errors.password ? 'border-rose-400' : 'border-slate-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-rose-600 font-medium">{errors.password}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                    }}
                    required
                    className={`w-full px-3.5 py-2.5 rounded-xl border bg-slate-50/50 text-slate-900 text-sm focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15 transition placeholder:text-slate-400 ${
                      errors.confirmPassword ? 'border-rose-400' : 'border-slate-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-xs text-rose-600 font-medium">{errors.confirmPassword}</p>}
              </div>

              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => {
                    setAgreedToTerms(e.target.checked);
                    if (errors.terms) setErrors({ ...errors, terms: '' });
                  }}
                  className="mt-1 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <label htmlFor="terms" className="text-xs text-slate-600 leading-normal">
                  I accept the Terms of Service and acknowledge the data privacy protocols.
                </label>
              </div>
              {errors.terms && <p className="text-xs text-rose-600 font-medium">{errors.terms}</p>}

              {errors.submit && (
                <div className="p-3 bg-rose-50 border border-rose-200/80 rounded-xl text-xs text-rose-700 font-medium">
                  {errors.submit}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition shadow-xs disabled:opacity-50"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
                <span className="px-3 bg-white text-slate-400 font-semibold">Or</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignup}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
              Already have an account?{' '}
              <Link href="/login" className="text-teal-700 font-semibold hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
