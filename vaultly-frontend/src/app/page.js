'use client';

import Link from "next/link";
import { TrendingUp, Users, Wallet, Search, Filter, BarChart3, LogOut, User } from "lucide-react";
import { useState, useEffect } from "react";
import { getCurrentUser, logout, wakeUpServer } from "../lib/api";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import Card from "../components/home/Card";
import HeroSection from "../components/home/HeroSection";
import SectionAnimator from "../components/SectionAnimator";

export default function Home() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    // Keep this fire-and-forget so the page can render immediately
    // in a logged-out state while the backend warms up.
    void wakeUpServer();

    async function checkAuth() {
      try {
        const response = await getCurrentUser();
        if (!isMounted) return;

        if (!response.error) {
          setUser(response.user);
        }

        // Redirect to dashboard if user is logged in.
        if (response.user) {
          router.push('/dashboard');
        }
      } finally {
        if (isMounted) {
          // no-op guard keeps async completion safe after unmount
        }
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    const response = await logout();
    if (response.error) {
      toast.error('Logout failed');
    } else {
      setUser(null);
      toast.success('Logged out successfully');
    }
  };

  return (
    <main id="main-content" className="min-h-screen brand-wash brand-grid">
      <Toaster position="top-right" />
      {/* Navigation Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-emerald-100">
        <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-linear-to-r from-emerald-700 to-blue-600 p-2 rounded-lg shadow-md shadow-emerald-700/20">
              <Wallet className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Vaultly</h1>
          </div>
          <nav className="flex gap-4 items-center" aria-label="Primary navigation">
            {user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                  <User className="text-gray-600" size={18} />
                  <span className="text-sm font-medium text-gray-900">{user.full_name}</span>
                </div>
                <Link href="/dashboard" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium">
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-gray-600 hover:text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition font-medium"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-600 hover:text-blue-600 font-medium transition duration-300">
                  Login
                </Link>
                <Link href="/signup" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium">
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <section id="features" className="bg-white/90 py-16 sm:py-24">
        <SectionAnimator className="px-4 sm:px-6 lg:px-8" staggerChildren={true}>
          <div className="text-center mb-16">
            <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Core Features
            </h3>
            <p className="text-lg text-gray-600">
              Everything you need for collaborative personal and group finance management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 overflow-hidden">
            <Card
              icon={<Wallet className="text-blue-600" size={32} />}
              title="Smart Expense Tracking"
              description="Add, categorize, and manage expenses with real-time summaries"
            />
            <Card
              icon={<Search className="text-blue-500" size={32} />}
              title="Advanced Search"
              description="Quickly find expenses by description, amount, or category"
            />
            <Card
              icon={<Filter className="text-amber-600" size={32} />}
              title="Flexible Filtering"
              description="Filter by date range, category, group, or goal status"
            />
            <Card
              icon={<TrendingUp className="text-emerald-600" size={32} />}
              title="Sorting & Pagination"
              description="Sort by amount, date, or name with efficient page navigation"
            />
            <Card
              icon={<Users className="text-purple-600" size={32} />}
              title="Group Goals"
              description="Create shared savings goals and track contributions together"
            />
            <Card
              icon={<BarChart3 className="text-indigo-600" size={32} />}
              title="Analytics & Reports"
              description="Interactive charts, spending trends, and exportable reports"
            />
          </div>
        </SectionAnimator>
      </section>

      {/* How It Works */}
      <section className="bg-linear-to-br from-emerald-50 to-blue-50 py-16 sm:py-24">
        <SectionAnimator className="px-4 sm:px-6 lg:px-8" staggerChildren={true}>
          <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-16">
            Three Simple Steps
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 overflow-hidden">
            <Card
              number="1"
              title="Sign Up & Authenticate"
              description="Create your account with secure JWT-based authentication and role-based access"
              variant="step"
            />
            <Card
              number="2"
              title="Track & Collaborate"
              description="Add expenses, create groups, invite members, and search/filter/sort data effortlessly"
              variant="step"
            />
            <Card
              number="3"
              title="Analyze & Export"
              description="View insights with interactive charts and export reports as PDF or CSV"
              variant="step"
            />
          </div>
        </SectionAnimator>
      </section>

      {/* Data Management Section */}
      <section className="bg-white/90 py-16 sm:py-24">
        <SectionAnimator className="px-4 sm:px-6 lg:px-8" staggerChildren={true}>
          <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-4">
            Advanced Data Management
          </h3>
          <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
            Vaultly provides enterprise-grade data retrieval with search, sort, filter, and pagination capabilities
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-hidden">
            <Card
              icon={<Search size={24} className="text-blue-600" />}
              title="Search"
              description="Find expenses by name, description, or amount instantly"
              variant="data"
            />
            <Card
              icon={<TrendingUp size={24} className="text-emerald-600" />}
              title="Sort"
              description="Sort by date, amount, category, or name in ascending/descending order"
              variant="data"
            />
            <Card
              icon={<Filter size={24} className="text-amber-600" />}
              title="Filter"
              description="Multi-filter support: category, date range, group, status"
              variant="data"
            />
            <Card
              icon={<BarChart3 size={24} className="text-indigo-600" />}
              title="Paginate"
              description="Efficient data loading with customizable page size and navigation"
              variant="data"
            />
          </div>
        </SectionAnimator>
      </section>

      {/* CTA Section */}
      <section className="bg-linear-to-r from-emerald-700 via-teal-700 to-blue-700 py-16 sm:py-20">
        <SectionAnimator className="px-4 sm:px-6 lg:px-8 text-center" animationType="slideUp">
          <h3 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready for Transparent Financial Collaboration?
          </h3>
          <p className="text-lg text-blue-100 mb-8">
            Join families, roommates, and friend groups managing finances together with confidence
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/signup" className="bg-white text-emerald-700 px-8 py-3 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition duration-300 inline-block">
              Sign Up for Free
            </Link>
            <Link href="/login" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-emerald-800/40 hover:scale-105 transition duration-300 inline-block">
              Already Have an Account?
            </Link>
          </div>
        </SectionAnimator>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 py-12">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8">
            <div className="md:w-1/3">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-linear-to-r from-emerald-700 to-blue-600 p-2 rounded-lg">
                  <Wallet className="text-white" size={20} />
                </div>
                <h4 className="text-white font-semibold">Vaultly</h4>
              </div>
              <p className="text-sm">Collaborative personal and group finance tracker with advanced search, filter, sort, and pagination.</p>
            </div>
            <div className="flex gap-16 md:w-2/3 justify-end">
              <div>
                <h4 className="text-white font-semibold mb-4">Features</h4>
                <ul className="text-sm space-y-2">
                  <li><Link href="#features" className="hover:text-white transition">Expense Tracking</Link></li>
                  <li><Link href="#features" className="hover:text-white transition">Group Goals</Link></li>
                  <li><Link href="#features" className="hover:text-white transition">Analytics</Link></li>
                  <li><Link href="#features" className="hover:text-white transition">Reports</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Security</h4>
                <ul className="text-sm space-y-2">
                  <li><span>JWT Authentication</span></li>
                  <li><span>Role-Based Access</span></li>
                  <li><span>Data Privacy</span></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Resources</h4>
                <ul className="text-sm space-y-2">
                  <li><span>Documentation</span></li>
                  <li><span>API Reference</span></li>
                  <li><span>Support</span></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 flex justify-center items-center">
            <p className="text-sm">© {new Date().getFullYear()} Vaultly. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
