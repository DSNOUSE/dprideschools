'use client';

import React from 'react';
import { Button } from './Button';
import Image from 'next/image';
import QuickLinks from './QuickLinks';

export default function Hero() {
  return (
    <div>
      <section className="relative min-h-[500px] md:min-h-[700px] overflow-hidden">
        {/* Modern gradient overlay */}
        <div className="absolute inset-0" />
        
        {/* Content */}
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="text-center">
              {/* Logo and Title */}
              <div className="mb-8">

                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-amber-400 uppercase leading-tight">
                  DPRIDE INTERNATIONAL SCHOOL
                </h1>
              </div>

              {/* Subtitle */}
              <p className="text-lg sm:text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
                Nurturing excellence, building character, and inspiring future leaders in a caring learning environment
              </p>

              
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-blue-900/20 to-transparent" />
        
        {/* Hero Images - Bottom Left and Right */}
        <div className="absolute bottom-0 -left-[75px] sm:left-6 lg:left-8 xl:left-16 z-20 max-h-[40%] sm:max-h-[50%] lg:max-h-[60%]" aria-hidden="true">
          <Image 
            src="/images/hero-girls.png" 
            alt="" 
            width={404}
            height={286}
            className="w-72 h-72 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-80 lg:h-80 xl:w-[404px] xl:h-[286px] object-contain object-bottom"
          />
        </div>

        <div className="absolute bottom-0 -right-[75px] sm:right-6 lg:right-8 xl:right-16 z-20 max-h-[40%] sm:max-h-[50%] lg:max-h-[60%]" aria-hidden="true">
          <Image 
            src="/images/hero-boy.png" 
            alt="" 
            width={251}
            height={392}
            className="object-contain object-bottom w-84 h-84 sm:w-36 sm:h-36 md:w-44 md:h-44 lg:w-56 lg:h-56 xl:w-[251px] xl:h-[392px]"
          />
        </div>
        
        {/* Scroll Indicator */}
        <Button 
          onClick={() => {
            const element = document.getElementById('about');
            if (element) {
              element.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
              });
            }
          }}
          variant="transparent"
          shape="pill"
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce z-30 hover:scale-110 transition-transform duration-200 cursor-pointer"
          aria-label="Scroll to content"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </Button>
      </section>
      <QuickLinks />
    </div>
  );
}