import type { InputHTMLAttributes } from "react";

interface UnderlineFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

function UnderlineField({ label, error, className = "", ...inputProps }: UnderlineFieldProps) {
  return (
    <div className="pr__field">
      <label className="pr__field-label">{label}</label>
      <input
        className={`pr__field-input ${error ? "pr__field-input--error" : ""} ${className}`}
        {...inputProps}
      />
      {error && <p className="pr__field-error">{error}</p>}
    </div>
  );
}

export default UnderlineField;
