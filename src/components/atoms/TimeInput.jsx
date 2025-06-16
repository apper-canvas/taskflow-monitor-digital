import React, { forwardRef, useEffect, useState } from "react";
import ApperIcon from "@/components/ApperIcon";

const TimeInput = forwardRef(({ value = '', onChange, className = '', ...props }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  
  // Update local value when prop changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);
  
  // Parse time string (HH:MM) into components
  const parseTime = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string') {
      return { hour: '12', minute: '00', period: 'AM' };
    }
    
    // Handle both HH:MM and partial inputs
    const parts = timeStr.split(':');
    let hour = parseInt(parts[0]) || 12;
    let minute = parseInt(parts[1]) || 0;
    
    const period = hour >= 12 ? 'PM' : 'AM';
    if (hour > 12) hour -= 12;
    if (hour === 0) hour = 12;
    
    return {
      hour: hour.toString(),
      minute: minute.toString().padStart(2, '0'),
      period
    };
  };
  
  // Convert components back to 24-hour format (HH:MM)
  const formatTime = (hour, minute, period) => {
    let h = parseInt(hour) || 12;
    let m = parseInt(minute) || 0;
    
    if (period === 'AM' && h === 12) h = 0;
    if (period === 'PM' && h !== 12) h += 12;
    
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };
  
  const { hour, minute, period } = parseTime(localValue);
  
const handleHourChange = (newHour) => {
    let h = parseInt(newHour);
    if (isNaN(h) || h < 1) h = 1;
    if (h > 12) h = 12;
    
    const newTime = formatTime(h, minute, period);
    setLocalValue(newTime);
    onChange?.(newTime);
  };
  
  const handleMinuteChange = (newMinute) => {
    let m = parseInt(newMinute);
    if (isNaN(m) || m < 0) m = 0;
    if (m > 59) m = 59;
    
    const newTime = formatTime(hour, m, period);
    setLocalValue(newTime);
    onChange?.(newTime);
  };
  
  const handlePeriodChange = (newPeriod) => {
    const newTime = formatTime(hour, minute, newPeriod);
    setLocalValue(newTime);
    onChange?.(newTime);
  };
  const handleDirectInput = (e) => {
    const inputValue = e.target.value;
    setLocalValue(inputValue);
    
    // Validate and format complete time strings
    if (/^\d{1,2}:\d{2}$/.test(inputValue)) {
      const [h, m] = inputValue.split(':').map(Number);
      if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
        onChange?.(inputValue);
      }
    } else if (inputValue === '') {
      onChange?.('');
    }
  };
  
  const handleBlur = () => {
    // Format incomplete input on blur
    if (localValue && localValue !== value) {
      const formatted = formatTimeInput(localValue);
      if (formatted) {
        setLocalValue(formatted);
        onChange?.(formatted);
      }
    }
  };
  
const formatTimeInput = (input) => {
    if (!input) return '';
    
    // Remove non-digits, colons, and AM/PM
    const cleaned = input.replace(/[^\d:apm\s]/gi, '');
    
    if (cleaned.includes(':')) {
      const parts = cleaned.split(':');
      const h = parseInt(parts[0]) || 1;
      const m = parseInt(parts[1]) || 0;
      
      // Validate for 12-hour format
      if (h >= 1 && h <= 12 && m >= 0 && m <= 59) {
        // Determine period from input or use current period
        const inputLower = input.toLowerCase();
        let detectedPeriod = period;
        if (inputLower.includes('am') || inputLower.includes('a')) {
          detectedPeriod = 'AM';
        } else if (inputLower.includes('pm') || inputLower.includes('p')) {
          detectedPeriod = 'PM';
        }
        
        return formatTime(h, m, detectedPeriod);
      }
    } else if (cleaned.length <= 4 && /^\d+$/.test(cleaned)) {
      // Handle HHMM format for 12-hour
      const nums = cleaned.padStart(4, '0');
      let h = parseInt(nums.slice(0, 2));
      const m = parseInt(nums.slice(2, 4));
      
      // Convert 24-hour input to 12-hour if needed
      let detectedPeriod = period;
      if (h === 0) {
        h = 12;
        detectedPeriod = 'AM';
      } else if (h > 12) {
        h = h - 12;
        detectedPeriod = 'PM';
      } else if (h === 12) {
        detectedPeriod = 'PM';
      }
      
      if (h >= 1 && h <= 12 && m >= 0 && m <= 59) {
        return formatTime(h, m, detectedPeriod);
      }
    }
    
    return localValue; // Return current value if input is invalid
  };
  
  return (
    <div className={`relative ${className}`}>
    <div
        className={`
        flex items-center bg-white border border-gray-300 rounded-lg px-3 py-2 
        focus-within:border-primary focus-within:ring-1 focus-within:ring-primary
        ${isOpen ? "border-primary ring-1 ring-primary" : ""}
      `}>
        <ApperIcon name="Clock" size={16} className="text-gray-400 mr-2" />
        {/* Direct time input */}
        <input
            ref={ref}
            type="text"
            value={localValue}
            onChange={handleDirectInput}
            onBlur={handleBlur}
            placeholder="HH:MM"
            className="flex-1 text-sm border-none outline-none bg-transparent"
            {...props} />
        <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="ml-2 text-gray-400 hover:text-gray-600 transition-colors">
            <ApperIcon name={isOpen ? "ChevronUp" : "ChevronDown"} size={16} />
        </button>
    </div>
    {/* Time picker dropdown */}
    {isOpen && <div
        className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
        <div className="flex items-center justify-center p-4 space-x-2">
            {/* Hour input */}
            <div className="flex flex-col items-center">
                <label className="text-xs text-gray-500 mb-1">Hour</label>
                <input
                    type="number"
                    min="1"
                    max="12"
                    value={hour}
                    onChange={e => handleHourChange(e.target.value)}
                    className="w-12 text-center border border-gray-300 rounded px-2 py-1 text-sm focus:border-primary focus:outline-none" />
            </div>
            <span className="text-lg font-semibold text-gray-600 mt-6">:</span>
            {/* Minute input */}
            <div className="flex flex-col items-center">
                <label className="text-xs text-gray-500 mb-1">Min</label>
                <input
                    type="number"
                    min="0"
                    max="59"
                    value={minute}
                    onChange={e => handleMinuteChange(e.target.value)}
                    className="w-12 text-center border border-gray-300 rounded px-2 py-1 text-sm focus:border-primary focus:outline-none" />
            </div>
            {/* AM/PM toggle */}
            <div className="flex flex-col items-center ml-2">
                <label className="text-xs text-gray-500 mb-1">Period</label>
                <div className="flex border border-gray-300 rounded overflow-hidden">
                    <button
                        type="button"
                        onClick={() => handlePeriodChange("AM")}
                        className={`px-2 py-1 text-xs font-medium transition-colors ${period === "AM" ? "bg-primary text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}>AM
                                        </button>
                    <button
                        type="button"
                        onClick={() => handlePeriodChange("PM")}
                        className={`px-2 py-1 text-xs font-medium transition-colors ${period === "PM" ? "bg-primary text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}>PM
                                        </button>
                </div>
            </div>
        </div>
    </div>}
</div>
  );
});

TimeInput.displayName = 'TimeInput';

export default TimeInput;