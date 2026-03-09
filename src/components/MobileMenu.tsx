"use client";
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Logo from './Logo';
import { Button } from './Button';
import { KeyboardArrowDown } from '@mui/icons-material';
import type { LinkItem } from './NavLinks';

type Props = {
  open: boolean;
  links: LinkItem[];
  onClose: () => void;
};

export default function MobileMenu({ open, links, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        className="absolute top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl mobile-menu-panel flex flex-col"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <Logo size="lg" variant="dark" />
          <Button
            onClick={onClose}
            variant="transparent"
            shape="pill"
            className="w-14 h-14 text-blue-600"
            aria-label="Close Menu"
          >
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto p-6">
          <div className="space-y-2">
            {links.map((l, index) => (
              <MobileMenuItem 
                key={l.href} 
                item={l} 
                index={index} 
                onClose={onClose}
              />
            ))}
          </div>
        </nav>

        <div className="p-6 border-t border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">DPRIDE International School</p>
            <p className="text-xs text-gray-500">Excellence in Education</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mobile menu item with expandable children
function MobileMenuItem({ item, index, onClose }: { item: LinkItem; index: number; onClose: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (item.children && item.children.length > 0) {
    return (
      <div className="mobile-menu-item" style={{ animationDelay: `${index * 100}ms` }}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full relative px-4 py-4 rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:shadow-md group text-left"
        >
          <span className="relative z-10 inline-flex items-center justify-between w-full text-lg font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
            <span className="inline-flex items-center gap-3">
              {item.icon ? <span className="text-blue-700">{item.icon}</span> : null}
              {item.label}
            </span>
            <KeyboardArrowDown 
              sx={{ fontSize: 20 }} 
              className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            />
          </span>
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
        </button>
        
        {isExpanded && (
          <div className="ml-4 mt-2 space-y-1 border-l-2 border-blue-200 pl-4">
            {item.children.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                onClick={onClose}
                className="block px-4 py-3 rounded-lg text-base text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                {child.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onClose}
      className="block mobile-menu-item"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="relative px-4 py-4 rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:shadow-md group-hover:text-blue-600 transition-colors">
        <span className="relative z-10 inline-flex items-center gap-3 text-lg font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
          {item.icon ? <span className="text-blue-700">{item.icon}</span> : null}
          {item.label}
        </span>
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
      </div>
    </Link>
  );
}
