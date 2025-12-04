import React from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helpText?: string;
}

export function FormInput({ label, error, helpText, className = '', ...props }: FormInputProps) {
  return (
    <div className="admin-form-group">
      <label className="admin-label">
        {label}
        {props.required && <span style={{ color: 'var(--dream-danger)' }}> *</span>}
      </label>
      <input
        className={`admin-input ${className}`}
        {...props}
      />
      {helpText && (
        <p className="text-xs mt-2" style={{ color: 'var(--dream-text-muted)' }}>
          {helpText}
        </p>
      )}
      {error && (
        <p className="text-xs mt-2" style={{ color: 'var(--dream-danger)' }}>
          {error}
        </p>
      )}
    </div>
  );
}
