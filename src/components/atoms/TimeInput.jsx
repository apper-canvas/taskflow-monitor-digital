import React, { forwardRef, useState } from "react";
import ApperIcon from "@/components/ApperIcon";
const TimeInput = forwardRef(({ 
  label,
  value = '',
  onChange,
  error,
  className = '',
  ...props 
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  
  // Parse the input value (24-hour format) to extract hour, minute, and AM/PM
  const parseTime = (timeValue) => {
    if (!timeValue) return { hour: '', minute: '', period: 'AM' };
    
    const [hours, minutes] = timeValue.split(':');
    const hourNum = parseInt(hours, 10);
    const hour12 = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
    const period = hourNum >= 12 ? 'PM' : 'AM';
    
    return {
      hour: hour12.toString(),
      minute: minutes || '',
      period
    };
  };

  // Convert 12-hour format to 24-hour format
  const formatTo24Hour = (hour, minute, period) => {
    if (!hour || !minute) return '';
    
    let hour24 = parseInt(hour, 10);
    if (period === 'AM' && hour24 === 12) hour24 = 0;
    if (period === 'PM' && hour24 !== 12) hour24 += 12;
    
    return `${hour24.toString().padStart(2, '0')}:${minute.padStart(2, '0')}`;
  };

  const { hour, minute, period } = parseTime(value);
  const hasValue = value && value.length > 0;
  const hasFloatingLabel = label;

  const handleHourChange = (newHour) => {
    const time24 = formatTo24Hour(newHour, minute, period);
    onChange?.(time24);
  };

  const handleMinuteChange = (newMinute) => {
    const time24 = formatTo24Hour(hour, newMinute, period);
    onChange?.(time24);
  };

  const handlePeriodChange = (newPeriod) => {
    const time24 = formatTo24Hour(hour, minute, newPeriod);
    onChange?.(time24);
  };

return (
    <div className={`relative ${className}`}>
    {hasFloatingLabel && <label
        className={`absolute left-3 transition-all duration-200 pointer-events-none z-10 ${isFocused || hasValue ? "top-2 text-xs text-primary font-medium" : "top-1/2 -translate-y-1/2 text-gray-500"}`}>
        {label}
    </label>}
    <div className="relative">
        <div
            className={`
            w-full border border-gray-300 rounded-lg transition-all duration-200 flex items-center justify-between gap-2
            focus-within:border-primary focus-within:ring-1 focus-within:ring-primary
            ${hasFloatingLabel ? "pt-6 pb-2 px-3" : "py-3 px-3"}
            ${error ? "border-error focus-within:border-error focus-within:ring-error" : ""}
          `}
            onFocus={() => setIsFocused(true)}
            onBlur={e => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                    setIsFocused(false);
                }
            }}>
            {/* Time Input Container */}
            <div className="flex items-center gap-1">
                {/* Hour Input */}
                <input
                    ref={ref}
                    type="number"
                    min="1"
                    max="12"
                    value={hour}
                    onChange={e => handleHourChange(e.target.value)}
                    className="w-8 text-center border-none outline-none bg-transparent text-sm"
                    placeholder="12"
                    {...props} />
                {/* Separator */}
                <span className="text-gray-400 text-sm">:</span>
                {/* Minute Input */}
                <input
                    type="number"
                    min="0"
                    max="59"
                    value={minute}
                    onChange={e => {
                        let val = e.target.value;

                        if (val.length === 1)
                            val = "0" + val;

                        if (val.length > 2)
                            val = val.slice(0, 2);

                        handleMinuteChange(val);
                    }}
                    className="w-8 text-center border-none outline-none bg-transparent text-sm"
                    placeholder="00" />
            </div>
            {/* AM/PM Selector */}
            <select
                value={period}
                onChange={e => handlePeriodChange(e.target.value)}
                className="border-none outline-none bg-transparent text-sm font-medium text-gray-700 cursor-pointer">
                <option value="AM">AM</option>
                <option value="PM">PM</option>
            </select>
        </div>
    </div>
    {error && <p className="mt-1 text-sm text-error">{error}</p>}
</div>
  );
});

TimeInput.displayName = 'TimeInput';

export default TimeInput;