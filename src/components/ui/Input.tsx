import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  required?: boolean;
}

let idCounter = 0;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, iconRight, required = false, className = '', id, type = 'text', ...props }, ref) => {
    const htmlId = id || `input-${++idCounter}`;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={htmlId} className="label">
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={htmlId}
            type={type}
            className={`input ${icon ? 'pl-10' : ''} ${iconRight ? 'pr-10' : ''} ${error ? 'input-error' : ''} ${className}`}
            {...props}
          />
          {iconRight && (
            <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
              {iconRight}
            </span>
          )}
        </div>
        {error && <p className="field-error">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-xs text-slate-400">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
