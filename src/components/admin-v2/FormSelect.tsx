import React from 'react';

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
  error?: string;
  helpText?: string;
}

export function FormSelect({ label, options, error, helpText, className = '', ...props }: FormSelectProps) {
  return (
    <div className="admin-form-group">
      <label className="admin-label">
        {label}
        {props.required && <span style={{ color: 'var(--dream-danger)' }}> *</span>}
      </label>
      <select
        className={`admin-select ${className}`}
        {...props}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
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
