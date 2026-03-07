'use client';

import { Button } from './Button';

export default function Footer() {
  return (
    <footer id="contact" className="border-t bg-[#1e3a8a] text-white">
      {/* Row 1: School Info, Logo, Email */}
      <div className="max-w-7xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-6">
        {/* School Info */}
        <div>
          <h3 className="font-semibold text-white mb-3 text-lg">VISIT US</h3>
          <p className="text-white">DPRIDE International School</p>
          <p className="text-white mt-2">No. 30B Oke Agbe Close</p>
          <p className="text-white">Off Ladoke Akintola Boulevard</p>
          <p className="text-white">Garki II, Abuja</p>
        </div>

        {/* Logo */}
        <div className="flex items-center justify-center">
          <img 
            src="/images/logo2.png" 
            alt="DPRIDE International School Logo" 
            className="h-24 w-auto"
          />
        </div>

        {/* Email */}
        <div className="text-right">
          <h3 className="font-semibold text-white mb-3 text-lg">CONTACT US</h3>
          <p className="text-white">
            <a href="tel:09037512828" className="hover:underline">09037512828, 08135967785</a>
          </p>
          <p className="text-white mt-2">
            <a href="mailto:info@dprideschools.com" className="hover:underline">info@dprideschools.com</a>
          </p>
          <p className="text-white mt-2 text-sm">Director: Maryam Salihu Mohammed</p>
        </div>
      </div>

      {/* Row 2: Copyright and Designed by */}
      <div className="w-full px-4 py-4 bg-[#1a2956]">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-4 items-center">
          {/* Copyright */}
          <div>
            <p className="text-white text-sm">
              © {new Date().getFullYear()} DPRIDE International School. All rights reserved.
            </p>
          </div>

          {/* Designed by */}
          <div className="text-right">
            <p className="text-white text-sm">
              Designed by{' '}
              <a 
                href="https://dsnouse.co.uk" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-yellow-300 transition-colors"
              >
                DSNOUSE
              </a>
            </p>
          </div>

          {/* Scroll to top button */}
          <div className="flex justify-end">
            <Button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              variant="yellow-pill"
              shape="pill"
              className="w-12 h-12"
              aria-label="Scroll to top"
            >
              ↑
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
