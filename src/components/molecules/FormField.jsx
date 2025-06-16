import Input from '@/components/atoms/Input';

const FormField = ({ 
  label, 
  error, 
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
        <Input
          label={label}
          error={error}
          required={required}
          {...props}
        />
      )}
    </div>
  );
};

export default FormField;