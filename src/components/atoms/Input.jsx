import { useState, forwardRef } from 'react';
import ApperIcon from '@/components/ApperIcon';

const Input = forwardRef(({ 
  label,
  type = 'text',
  placeholder,
  error,
  icon,
  iconPosition = 'left',
  className = '',
  ...props 
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = props.value && props.value.length > 0;
  const hasFloatingLabel = label && type !== 'checkbox';

  return (
    <div className={`relative ${className}`}>
      {hasFloatingLabel && (
        <label
          className={`absolute left-3 transition-all duration-200 pointer-events-none ${
            isFocused || hasValue
              ? 'top-2 text-xs text-primary font-medium'
              : 'top-1/2 -translate-y-1/2 text-gray-500'
          }`}
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <ApperIcon
            name={icon}
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
        )}
        
        <input
          ref={ref}
          type={type}
          placeholder={hasFloatingLabel ? '' : placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full border border-gray-300 rounded-lg transition-all duration-200
            focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none
            ${hasFloatingLabel ? 'pt-6 pb-2 px-3' : 'py-3 px-3'}
            ${icon && iconPosition === 'left' ? 'pl-10' : ''}
            ${icon && iconPosition === 'right' ? 'pr-10' : ''}
            ${error ? 'border-error focus:border-error focus:ring-error' : ''}
          `}
          {...props}
        />
        
        {icon && iconPosition === 'right' && (
          <ApperIcon
            name={icon}
            size={18}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-error flex items-center">
          <ApperIcon name="AlertCircle" size={14} className="mr-1" />
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;