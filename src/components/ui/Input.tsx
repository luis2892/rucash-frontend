import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  required?: boolean;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, required = false, icon, className = '', id, type = 'text', ...props }, ref) => {
    const htmlId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div>
        {label && (
          <label htmlFor={htmlId} className="label">
            {label}
            {required && <span className="text-red-600 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-3 text-gray-400 flex items-center">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={htmlId}
            type={type}
            className={`
              input-field
              ${icon ? 'pl-10' : ''}
              ${error ? 'input-field-error' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
