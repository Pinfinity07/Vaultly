"use client";

import { useState, useEffect } from "react";
import { User, Mail, Calendar, Edit3, Save, X, Shield, Award, TrendingUp, Hash, CheckCircle2 } from "lucide-react";
import { getCurrentUser, updateUser, getUserExpenses } from "../../lib/api";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Navigation from "../../components/Navigation";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      const userResponse = await getCurrentUser();
      if (!isMounted) return;

      if (userResponse?.error || !userResponse?.user) {
        toast.error("Session expired");
        router.push("/login");
      } else {
        setUser(userResponse.user);
        setFormData({
          full_name: userResponse.user.full_name || "",
          email: userResponse.user.email || "",
        });

        const expensesResponse = await getUserExpenses({ limit: 100 });
        if (isMounted && !expensesResponse?.error) {
          setExpenses(expensesResponse?.expenses || []);
        }
        setLoading(false);
      }
    }
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!formData.full_name.trim() || !formData.email.trim()) {
      toast.error("Full name and email are required");
      return;
    }

    setIsSaving(true);
    try {
      const response = await updateUser(user.id, formData);
      if (response?.error) {
        toast.error(response.error);
      } else if (response?.user) {
        setUser(response.user);
        setIsEditing(false);
        toast.success("Profile updated successfully");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: user?.full_name || "",
      email: user?.email || "",
    });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/70">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse space-y-6">
          <div className="h-44 bg-slate-200/80 rounded-2xl" />
          <div className="h-64 bg-slate-200/80 rounded-2xl" />
        </div>
      </div>
    );
  }

  const totalTracked = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
  const avgExpense = expenses.length > 0 ? totalTracked / expenses.length : 0;
  const createdDate = user?.createdAt ? new Date(user.createdAt) : new Date();
  const memberSinceFormatted = !isNaN(createdDate.getTime())
    ? createdDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "Active Member";

  const displayName = user?.full_name || "User";
  const userInitials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl shadow-xs">
                {userInitials || <User size={24} />}
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{displayName}</h1>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{user?.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200/60">
                    <CheckCircle2 size={12} />
                    <span>Verified Account</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                    <Shield size={12} />
                    <span>Role: {user?.role || "user"}</span>
                  </span>
                </div>
              </div>
            </div>

            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition self-start sm:self-auto"
              >
                <Edit3 size={15} />
                <span>Edit Profile</span>
              </button>
            )}
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 text-center">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Total Tracked</span>
              <span className="text-xl font-bold text-slate-900 tabular-nums">${totalTracked.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Avg Transaction</span>
              <span className="text-xl font-bold text-slate-900 tabular-nums">${avgExpense.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Total Entries</span>
              <span className="text-xl font-bold text-slate-900 tabular-nums">{expenses.length}</span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Member Since</span>
              <span className="text-xs font-semibold text-slate-700 block mt-1">{memberSinceFormatted}</span>
            </div>
          </div>
        </div>

        {/* Profile Information & Edit Form */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Account Parameters</h2>
            <p className="text-xs text-slate-500">Manage identity credentials and profile data</p>
          </div>

          <div className="space-y-4 max-w-xl">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              {isEditing ? (
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15 transition text-sm"
                  />
                </div>
              ) : (
                <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-sm font-medium text-slate-900">
                  {user?.full_name}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              {isEditing ? (
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15 transition text-sm"
                  />
                </div>
              ) : (
                <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-sm font-medium text-slate-900">
                  {user?.email}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Account ID
              </label>
              <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-mono text-slate-500 truncate">
                {user?.id}
              </div>
            </div>

            {isEditing && (
              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  <Save size={14} />
                  <span>{isSaving ? "Saving..." : "Save Changes"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Security & Architecture Overview */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Security & Session Status</h2>
            <p className="text-xs text-slate-500">Security configurations protecting your session</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="font-semibold text-slate-900 block mb-1">Session Protocol</span>
              <p className="text-slate-500">JWT Token stored in httpOnly, SameSite-scoped cookie.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="font-semibold text-slate-900 block mb-1">Encryption</span>
              <p className="text-slate-500">Bcrypt hash salt with rounds configured server-side.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="font-semibold text-slate-900 block mb-1">OAuth Security</span>
              <p className="text-slate-500">State signature token with transient database retries.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
