import React from 'react';

interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

/**
 * Separator component
 */
export default function Separator({
  orientation = 'horizontal',
  className = '',
}: SeparatorProps) {
  const orientationClasses = {
    horizontal: 'h-px w-full',
    vertical: 'h-full w-px',
  };

  return (
    <div
      className={`
        ${orientationClasses[orientation]}
        bg-gray-200
        ${className}
      `}
    />
  );
}
