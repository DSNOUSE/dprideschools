'use client';

import { Button } from './Button';

export default function HelpButton() {
  return (
    <Button
      aria-label="Help"
      variant="yellow-pill"
      shape="pill"
      className="group fixed bottom-6 right-6 z-50 grid h-12 w-12 place-items-center rounded-full shadow-lg shadow-black/30 hover:shadow-black/40 transition-all duration-300"
    >
      Help
    </Button>
  );
}
