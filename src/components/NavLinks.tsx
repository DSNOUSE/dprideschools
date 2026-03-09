"use client";
import Link from 'next/link';
import React, { useState } from 'react';
import { KeyboardArrowDown } from '@mui/icons-material';

export type LinkItem = { 
  href: string; 
  label: string; 
  icon?: React.ReactNode;
  children?: LinkItem[];
};

type Props = {
  links: LinkItem[];
  className?: string;
  onItemClick?: () => void;
  vertical?: boolean;
};

export default function NavLinks({ links, className = '', onItemClick, vertical = false }: Props) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <nav className={`${className} ${vertical ? 'flex flex-col' : 'flex items-center gap-3 sm:gap-4 lg:gap-4 xl:gap-6'}`}>
      {links.map((l) => {
        if (l.children && l.children.length > 0 && !vertical) {
          // Desktop dropdown menu
          return (
            <div 
              key={l.href}
              className="relative group"
              onMouseEnter={() => setOpenDropdown(l.label)}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button
                className="nav-button inline-flex items-center gap-1"
              >
                <span className="inline-flex items-center gap-2">
                  {l.icon ? <span className="text-blue-700">{l.icon}</span> : null}
                  <span>{l.label}</span>
                </span>
                <KeyboardArrowDown 
                  sx={{ fontSize: 18 }} 
                  className={`transition-transform duration-200 ${openDropdown === l.label ? 'rotate-180' : ''}`}
                />
              </button>
              
              {/* Dropdown menu */}
              <div className={`absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50`}>
                {l.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={() => onItemClick?.()}
                    className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            </div>
          );
        }
        
        // Regular link
        return (
          <Link
            key={l.href}
            href={l.href}
            onClick={() => onItemClick?.()}
            className={`nav-button ${vertical ? 'w-full' : ''}`}
          >
            <span className="inline-flex items-center gap-2">
              {l.icon ? <span className="text-blue-700">{l.icon}</span> : null}
              <span>{l.label}</span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
