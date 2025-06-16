import Input from "@/components/atoms/Input";
import TimeInput from "@/components/atoms/TimeInput";
import React from "react";

const FormField = ({ 
  label, 
  error, 
  type,
  required = false, 
  className = '', 
  children,
  ...props 
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && !children && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
{children || (
        type === 'time' ? (
          <TimeInput
            label={label}
            error={error}
            required={required}
            {...props}
          />
        ) : (
          <Input
            label={label}
            type={type}
            error={error}
            required={required}
            {...props}
          />
        )
      )}
    </div>
  );
};

export default FormField;