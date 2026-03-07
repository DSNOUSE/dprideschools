import clsx from 'clsx';

export default function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={clsx('max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 bg-white my-4 py-6 rounded-lg shadow-sm', className)}>{children}</div>;
}
