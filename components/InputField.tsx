import React, { useState } from 'react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: string;
  error?: string;
  rightAction?: React.ReactNode;
}

export const InputField: React.FC<InputFieldProps> = ({ 
  label, 
  icon, 
  error, 
  rightAction,
  className = '',
  type = 'text',
  disabled,
  ...props 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-bold uppercase tracking-wide text-primary/60 dark:text-slate-500 ml-1">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="material-symbols-outlined absolute left-3 dark:left-4 top-1/2 -translate-y-1/2 text-primary/40 dark:text-slate-500 pointer-events-none select-none">
            {icon}
          </span>
        )}
        <input
          type={inputType}
          disabled={disabled}
          className={`
            w-full rounded-xl border-primary/10 dark:border-slate-700 
            bg-white dark:bg-slate-800/50 py-3.5 dark:py-4 
            ${icon ? 'pl-10 dark:pl-12' : 'pl-4'} 
            ${(isPassword || rightAction) ? 'pr-12' : 'pr-4'}
            text-sm dark:text-white 
            focus:border-primary dark:focus:border-blue-500 focus:ring-primary dark:focus:ring-blue-500 
            shadow-sm transition-colors 
            placeholder:text-slate-400 dark:placeholder:text-slate-600 
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
          `}
          {...props}
        />
        
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={disabled}
            className="absolute right-3 dark:right-4 top-1/2 -translate-y-1/2 text-primary/40 dark:text-slate-500 hover:text-primary dark:hover:text-slate-300 transition-colors disabled:opacity-50"
            tabIndex={-1}
          >
            <span className="material-symbols-outlined select-none">
              {showPassword ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        )}

        {!isPassword && rightAction && (
             <div className="absolute right-3 dark:right-4 top-1/2 -translate-y-1/2">
                 {rightAction}
             </div>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-500 font-bold ml-1 animate-in slide-in-from-top-1">
            {error}
        </p>
      )}
    </div>
  );
};