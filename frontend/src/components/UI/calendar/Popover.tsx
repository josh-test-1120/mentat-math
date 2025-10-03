'use client'

import React, { ReactNode, useEffect, useRef } from 'react';

type PopoverProps = {
  isOpen: boolean;
  anchor: { x: number; y: number } | null;
  onClose: () => void;
  className?: string;
  children: ReactNode;
};

export default function Popover({ isOpen, anchor, onClose, className, children }: PopoverProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (ref.current && !ref.current.contains(target)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !anchor) return null;

  const style: React.CSSProperties = {
    position: 'fixed',
    top: Math.max(8, anchor.y + 8),
    left: Math.max(8, anchor.x + 8),
    zIndex: 1000
  };

  return (
    <div style={style} className={`shadow-lg rounded-md border border-mentat-gold/20 bg-zinc-900 text-mentat-gold ${className || ''}`} ref={ref}>
      {children}
    </div>
  );
}
