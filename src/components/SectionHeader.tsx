import clsx from 'clsx';

type SectionHeaderProps = {
  kicker?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
};

export default function SectionHeader({ kicker, title, description, align = 'left', className }: SectionHeaderProps) {
  const alignCls = align === 'center' ? 'text-center' : 'text-left';
  return (
    <div className={clsx('space-y-2', alignCls, className)}>
      {kicker && <div className="text-xs font-semibold tracking-widest text-blue-600 uppercase">{kicker}</div>}
      {align === 'center' ? (
        <div className="flex items-center justify-center gap-3">
          <img 
            src="/images/title-img.svg" 
            alt="" 
            className="w-6 h-6"
            aria-hidden="true"
          />
          <h2 className="text-2xl md:text-3xl font-semibold">{title}</h2>
        </div>
      ) : (
        <h2 className="text-2xl md:text-3xl font-semibold">{title}</h2>
      )}
      {description && <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">{description}</p>}
    </div>
  );
}
