"use client";
import Link from 'next/link';
import React from 'react';

type LinkItem = { href: string; label: string };

type Props = {
  links: LinkItem[];
  className?: string;
  onItemClick?: () => void;
  vertical?: boolean;
};

export default function NavLinks({ links, className = '', onItemClick, vertical = false }: Props) {
  return (
    <nav className={`${className} ${vertical ? 'flex flex-col' : 'flex items-center gap-3 sm:gap-4 lg:gap-4 xl:gap-6'}`}>
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          onClick={() => onItemClick?.()}
          className={`nav-button ${vertical ? 'w-full' : ''}`}
        >
          <span>{l.label}</span>
        </Link>
      ))}
    </nav>
  );
}
