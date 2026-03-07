"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Logo from './Logo';
import HamburgerButton from './HamburgerButton';
import NavLinks from './NavLinks';
import MobileMenu from './MobileMenu';
import { LinkButton } from './Button';

const links = [
  { href: '/our-school', label: 'Our School' },
  { href: '/nursery', label: 'Our Nursery' },
  { href: '/teaching', label: 'Teaching' },
  { href: '/parents', label: 'Parents' },
  { href: '/calendar', label: 'Calendar' },
  { href: '/results', label: 'Results' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const onHome = pathname === "/";

  // No scroll-based color changes: nav appearance is constant

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      {/* Top Contact Bar */}
      <div className="bg-blue-900 text-white py-1 sm:py-2 px-3 sm:px-4 lg:px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
            <a href="tel:+256123456789" className="flex items-center gap-1 sm:gap-2 hover:text-yellow-300 transition-colors">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
              </svg>
              <span className="hidden sm:inline">09037512828, 08135967785</span>
              <span className="sm:hidden">Call Us</span>
            </a>
            <a href="mailto:info@dprideschools.com" className="flex items-center gap-1 sm:gap-2 hover:text-yellow-300 transition-colors">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
              </svg>
              <span className="hidden sm:inline">info@dprideschools.com</span>
              <span className="sm:hidden">Email</span>
            </a>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-6 h-6 sm:w-8 sm:h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all hover:scale-110">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-6 h-6 sm:w-8 sm:h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all hover:scale-110">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
              </svg>
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-6 h-6 sm:w-8 sm:h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all hover:scale-110">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>

      <header className="top-0 z-40 w-full border-b border-transparent bg-white">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 min-h-[80px] sm:min-h-[90px] lg:min-h-[100px] flex items-center justify-between">
          <div className="flex items-center">
            <Logo size="xl" variant={onHome ? 'light' : 'dark'} />
          </div>

          {/* Desktop Navigation - hidden on mobile */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            <NavLinks links={links} className="flex items-center gap-4 xl:gap-6" />
            <LinkButton 
              href="/contact" 
              size="md" 
              shape="pill"
              variant="blue-pill"
              className="ml-2 xl:ml-4"
            >
              Contact Us
            </LinkButton>
          </div>

          {/* Hamburger (mobile/tablet) */}
          <div className="lg:hidden ml-2 sm:ml-4">
            <HamburgerButton open={open} onClick={() => setOpen(!open)} variant="blue" />
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <MobileMenu open={open} links={links} onClose={() => setOpen(false)} />
    </>
  );
}
