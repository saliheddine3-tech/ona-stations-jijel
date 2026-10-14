import React from 'react';
import { Phone } from 'lucide-react';

interface PhoneLinkProps {
  phone: string;
  name?: string;
  label?: string;
  className?: string;
  variant?: 'badge' | 'button' | 'inline' | 'compact';
}

export const PhoneLink: React.FC<PhoneLinkProps> = ({
  phone,
  name,
  label,
  className = '',
  variant = 'badge'
}) => {
  if (!phone) return <span className="text-slate-400 text-xs">لا يوجد هاتف</span>;

  // Clean phone number for tel: protocol
  const cleanPhone = phone.replace(/[^\d+]/g, '');

  if (variant === 'button') {
    return (
      <a
        href={`tel:${cleanPhone}`}
        title={`اتصال هاتفي بـ ${name || phone}`}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all active:scale-95 ${className}`}
        dir="ltr"
        onClick={(e) => e.stopPropagation()}
      >
        <Phone className="w-3.5 h-3.5 text-white animate-pulse" />
        <span>{phone}</span>
        {label && <span className="text-[10px] bg-emerald-700/60 px-1 rounded ml-1">{label}</span>}
      </a>
    );
  }

  if (variant === 'compact') {
    return (
      <a
        href={`tel:${cleanPhone}`}
        title={`اتصال بـ ${name || phone}`}
        className={`inline-flex items-center gap-1 p-1 px-2 text-xs font-medium text-emerald-400 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-800/40 rounded transition-colors ${className}`}
        dir="ltr"
        onClick={(e) => e.stopPropagation()}
      >
        <Phone className="w-3 h-3 text-emerald-400" />
        <span>{phone}</span>
      </a>
    );
  }

  return (
    <a
      href={`tel:${cleanPhone}`}
      title={`اتصال مباشر بـ ${name || phone}`}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/50 rounded-md transition-all active:scale-95 group ${className}`}
      dir="ltr"
      onClick={(e) => e.stopPropagation()}
    >
      <Phone className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
      <span className="font-mono tracking-wider">{phone}</span>
    </a>
  );
};
