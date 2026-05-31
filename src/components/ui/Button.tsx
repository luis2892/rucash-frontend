import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'teal' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading = false, icon, iconRight, fullWidth = false, disabled, children, className = '', ...props }, ref) => {
    const variantClass = {
      primary:   'btn-primary',
      teal:      'btn-teal',
      secondary: 'btn-secondary',
      ghost:     'btn-ghost',
      danger:    'btn-danger',
      outline:   'btn-outline',
    }[variant];

    const sizeClass = {
      sm: 'btn-sm',
      md: 'btn-md',
      lg: 'btn-lg',
      xl: 'btn-xl',
    }[size];

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${variantClass} ${sizeClass} ${fullWidth ? 'w-full' : ''} ${className}`}
        {...props}
      >
        {isLoading ? <Loader2 size={16} className="animate-spin" /> : icon}
        {children}
        {!isLoading && iconRight}
      </button>
    );
  }
);
Button.displayName = 'Button';
