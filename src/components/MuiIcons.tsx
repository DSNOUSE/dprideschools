'use client';

// This module previously re-exported icons from MUI.
// To keep the UI lightweight and avoid external icon dependencies
// in environments where MUI may not be available, we now provide
// simple React components that render emoji-based icons instead.

import React from 'react';

type IconProps = React.HTMLAttributes<HTMLSpanElement>;

const makeIcon =
  (glyph: string) =>
  ({ className = '', ...rest }: IconProps) =>
    (
      <span
        className={`inline-flex items-center justify-center ${className}`}
        aria-hidden="true"
        {...rest}
      >
        {glyph}
      </span>
    );

export const School = makeIcon('🏫');
export const EmojiEvents = makeIcon('🏆');
export const Lightbulb = makeIcon('💡');
export const Favorite = makeIcon('❤️');
export const Star = makeIcon('⭐');
export const Groups = makeIcon('👥');
export const Security = makeIcon('🛡️');
export const MenuBook = makeIcon('📘');
export const Computer = makeIcon('💻');
export const Science = makeIcon('🧪');
export const LocalLibrary = makeIcon('📚');
export const SportsBasketball = makeIcon('🏀');
export const Palette = makeIcon('🎨');
export const Attractions = makeIcon('🎡');
export const LocalHospital = makeIcon('🏥');
export const Restaurant = makeIcon('🍽️');
export const Visibility = makeIcon('👁️');
export const FlashOn = makeIcon('⚡');
export const CheckCircle = makeIcon('✔️');
