import React from 'react';

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  helpText?: string;
}

export function FormTextarea({ label, error, helpText, className = '', ...props }: FormTextareaProps) {
  return (
    <div className="admin-form-group">
      <label className="admin-label">
        {label}
        {props.required && <span style={{ color: 'var(--dream-danger)' }}> *</span>}
      </label>
      <textarea
        className={`admin-textarea ${className}`}
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
