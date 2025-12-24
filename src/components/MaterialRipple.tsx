import { ReactNode } from 'react';

interface MaterialRippleProps {
  children: ReactNode;
  className?: string;
}

export default function MaterialRipple({ children, className = '' }: MaterialRippleProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

