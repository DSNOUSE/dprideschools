import * as React from 'react';

type TypographyProps<T extends React.ElementType> = {
  as?: T;
  className?: string;
} & Omit<React.ComponentPropsWithoutRef<T>, 'as' | 'className'>;

const joinClassNames = (...values: Array<string | undefined>) => values.filter(Boolean).join(' ');

export function Heading<T extends React.ElementType = 'h2'>(props: TypographyProps<T>) {
  const { as, className, ...rest } = props;
  const Component = (as || 'h2') as React.ElementType;

  return (
    <Component
      className={joinClassNames('text-3xl md:text-4xl font-bold text-gray-900', className)}
      {...rest}
    />
  );
}

export function Lead<T extends React.ElementType = 'p'>(props: TypographyProps<T>) {
  const { as, className, ...rest } = props;
  const Component = (as || 'p') as React.ElementType;

  return (
    <Component
      className={joinClassNames('text-lg text-gray-600 leading-relaxed', className)}
      {...rest}
    />
  );
}

export default function Text<T extends React.ElementType = 'p'>(props: TypographyProps<T>) {
  const { as, className, ...rest } = props;
  const Component = (as || 'p') as React.ElementType;

  return (
    <Component
      className={joinClassNames('text-base text-gray-700 leading-relaxed', className)}
      {...rest}
    />
  );
}
