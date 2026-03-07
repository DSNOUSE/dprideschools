"use client";
import clsx from 'clsx';

type ButtonSize = 'sm' | 'md' | 'lg';
type ButtonShape = 'rounded' | 'pill';
type ButtonVariant = 'yellow' | 'blue' | 'red' | 'yellow-pill' | 'blue-pill' | 'red-pill' | 'transparent';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: ButtonSize;
  shape?: ButtonShape;
  variant?: ButtonVariant;
};

const base = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
const shapes: Record<ButtonShape, string> = {
  rounded: 'rounded',
  pill: 'rounded-3xl',
};
const sizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};
const variants: Record<ButtonVariant, string> = {
  yellow: 'bg-yellow-400 text-gray-800 border border-gray-800 hover:bg-yellow-500 focus:ring-yellow-400',
  blue: 'bg-blue-600 text-white border border-blue-700 hover:bg-blue-700 focus:ring-blue-600',
  red: 'bg-red-600 text-white border border-red-700 hover:bg-red-700 focus:ring-red-600',
  'yellow-pill': 'bg-yellow-400 text-gray-800 border border-gray-800 hover:bg-yellow-500 focus:ring-yellow-400 rounded-3xl',
  'blue-pill': 'bg-blue-600 text-white border border-blue-700 hover:bg-blue-700 focus:ring-blue-600 rounded-3xl',
  'red-pill': 'bg-red-600 text-white border border-red-700 hover:bg-red-700 focus:ring-red-600 rounded-3xl',
  transparent: 'bg-transparent text-gray-600 border border-transparent hover:bg-transparent focus:ring-gray-600'
};

export function Button({ className, size = 'md', shape = 'rounded', variant = 'yellow', ...props }: ButtonProps) {
  return <button className={clsx(base, shapes[shape], sizes[size], variants[variant], className)} {...props} />;
}

export function LinkButton({ className, size = 'md', shape = 'rounded', variant = 'yellow', href = '#', children }: { className?: string; size?: ButtonSize; shape?: ButtonShape; variant?: ButtonVariant; href?: string; children: React.ReactNode }) {
  return (
    <a href={href} className={clsx(base, shapes[shape], sizes[size], variants[variant], className)}>
      {children}
    </a>
  );
}
