import React from 'react';

export default function Badge({ children, variant = 'default', size = 'sm', className = '' }) {
  const sizeClasses = {
    xs: 'px-2 py-0.5 text-[10px]',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  };

  const variantClasses = {
    credit: 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 font-semibold',
    debit: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold',
    category: 'bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium',
    active: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-medium',
    used: 'bg-slate-700/40 text-slate-400 border border-slate-600/30 line-through font-normal',
    warning: 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold',
    danger: 'bg-rose-500/15 text-rose-400 border border-rose-500/30 font-semibold',
    default: 'bg-slate-800 text-slate-300 border border-slate-700/60 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full uppercase tracking-wider ${sizeClasses[size] || sizeClasses.sm} ${
        variantClasses[variant] || variantClasses.default
      } ${className}`}
    >
      {children}
    </span>
  );
}
