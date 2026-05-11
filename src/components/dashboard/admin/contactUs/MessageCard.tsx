'use client';

import { getInitials } from '@/utils/helpers';
import { FaPhone, FaEnvelope } from 'react-icons/fa';

interface MessageCardProps {
  name: string;
  phone: string;
  email: string;
  message: string;
}

export function MessageCard({ name, phone, email, message }: MessageCardProps) {
  return (
    <div className="group relative bg-gradient-to-br from-primary via-primary/90 to-secondary rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.20)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col overflow-hidden w-full">

      {/* Subtle decorative circle */}
      <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/5 pointer-events-none" aria-hidden="true" />
      <div className="absolute -bottom-8 -left-6 w-24 h-24 rounded-full bg-black/10 pointer-events-none" aria-hidden="true" />

      {/* Card body */}
      <div className="relative p-5 flex flex-col gap-4 flex-1">

        {/* Identity row */}
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white text-base font-bold shrink-0 tracking-wide">
            {getInitials(name)}
          </div>
          {/* Name */}
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-white truncate leading-snug">{name}</h3>
            <p className="text-[10px] font-medium uppercase tracking-widest text-white/50 mt-0.5">Contact</p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/15" />

        {/* Contact links */}
        <div className="space-y-1.5">
          {/* Phone */}
          
          <a  href={`tel:${phone}`}
            className="flex items-center gap-3 group/row rounded-xl px-3 py-2.5 hover:bg-white/10 transition-colors duration-150"
          >
            <div className="w-8 h-8 rounded-lg bg-white/15 border border-white/20 flex items-center justify-center shrink-0 group-hover/row:bg-white transition-colors duration-200">
              <FaPhone size={12} className="text-white group-hover/row:text-primary transition-colors duration-200" />
            </div>
            <span className="text-sm font-medium text-white/80 group-hover/row:text-white transition-colors duration-150 truncate" dir="ltr">
              {phone}
            </span>
          </a>

          {/* Email */}
          
          <a  href={`mailto:${email}`}
            className="flex items-center gap-3 group/row rounded-xl px-3 py-2.5 hover:bg-white/10 transition-colors duration-150"
          >
            <div className="w-8 h-8 rounded-lg bg-white/15 border border-white/20 flex items-center justify-center shrink-0 group-hover/row:bg-white transition-colors duration-200">
              <FaEnvelope size={12} className="text-white group-hover/row:text-primary transition-colors duration-200" />
            </div>
            <span className="text-sm font-medium text-white/80 group-hover/row:text-white transition-colors duration-150 truncate">
              {email}
            </span>
          </a>
        </div>

        {/* Message */}
        {message && (
          <>
            <div className="h-px bg-white/15" />
            <div className="rounded-xl bg-black/15 border border-white/10 px-4 py-3">
              <p className="text-xs text-white/70 leading-relaxed line-clamp-4">{message}</p>
            </div>
          </>
        )}

      </div>
    </div>
  );
}