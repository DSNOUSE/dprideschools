"use client";
import Image from 'next/image';
import Link from 'next/link';
import clsx from 'clsx';

type LogoProps = {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'light' | 'dark';
  className?: string;
  width?: number;
  height?: number;
};

export default function Logo({ size = 'lg', variant = 'dark', className, width, height }: LogoProps) {
  const sizeClasses = {
    sm: { width: 32, height: 32 }, // 32px
    md: { width: 40, height: 40 }, // 40px
    lg: { width: 48, height: 48 }, // 48px
    xl: { width: 64, height: 64 }, // 64px
    '2xl': { width: 80, height: 80 } // 80px
  };
  
  // Use custom dimensions if provided, otherwise use size-based dimensions
  const imageWidth = width || sizeClasses[size].width;
  const imageHeight = height || sizeClasses[size].height;
  
  return (
    <Link href="/" className={clsx('flex items-center justify-center', className)}>
      <Image 
        src="/images/logo2.png" 
        alt="DPRIDE Logo" 
        width={imageWidth}
        height={imageHeight}
        className="object-contain transition-transform duration-200 hover:scale-105"
        priority
      />
    </Link>
  );
}
