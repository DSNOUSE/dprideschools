"use client";
import React from 'react';

type Props = {
  open: boolean;
  onClick: () => void;
  variant?: 'light' | 'dark' | 'blue';
};

export default function HamburgerButton({ open, onClick, variant = 'dark' }: Props) {
  const colorClass = variant === 'light' ? 'bg-white' : variant === 'blue' ? 'bg-blue-600' : 'bg-gray-800';

  return (
    <button
      aria-label="Toggle Menu"
      aria-expanded={open}
      onClick={onClick}
      className={`lg:hidden relative w-14 h-12 flex flex-col items-center justify-center gap-1 transition-all duration-300 ${
        variant === 'light' ? 'text-white' : 'text-gray-800'
      }`}
    >
      <span
        className={`w-8 h-1 rounded-full hamburger-line transition-transform ${
          open ? 'rotate-45 translate-y-2.5' : 'rotate-0 translate-y-0'
        } ${colorClass}`}
      />
      <span
        className={`w-8 h-1 rounded-full hamburger-line transition-all ${
          open ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
        } ${colorClass}`}
      />
    </button>
  );
}
