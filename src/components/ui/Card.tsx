import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  compact?: boolean;
  hoverable?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ compact = false, hoverable = true, className = '', children, ...props }, ref) => (
    <div
      ref={ref}
      className={`
        ${compact ? 'card-compact' : 'card'}
        ${hoverable ? 'hover:shadow-md' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
);

Card.displayName = 'Card';
