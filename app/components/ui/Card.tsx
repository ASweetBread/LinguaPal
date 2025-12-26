import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

/**
 * Card component
 */
export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`rounded-lg border border-border bg-card shadow-sm ${className}`}>
      {children}
    </div>
  );
}

/**
 * Card content component
 */
export function CardContent({ children, className = '' }: CardContentProps) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}

/**
 * Card header component
 */
export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return <div className={`p-6 pt-0 ${className}`}>{children}</div>;
}

/**
 * Card footer component
 */
export function CardFooter({ children, className = '' }: CardFooterProps) {
  return <div className={`flex items-center p-6 pt-0 ${className}`}>{children}</div>;
}
