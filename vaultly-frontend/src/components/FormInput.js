'use client';

export default function FormInput({ 
  label, 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  error,
  required = false 
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full px-3.5 py-2.5 rounded-xl border bg-slate-50/50 text-slate-900 text-sm focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15 transition placeholder:text-slate-400 ${
          error ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
        }`}
      />
      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
    </div>
  );
}
