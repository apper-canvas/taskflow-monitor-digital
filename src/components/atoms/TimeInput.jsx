import React, { forwardRef, useEffect, useRef, useState } from "react";
import ApperIcon from "@/components/ApperIcon";

const TimeInput = forwardRef(({ value = '', onChange, className = '', placeholder = 'Select time', ...props }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  
  // Update local value when prop changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Parse time string (HH:MM 24-hour) into 12-hour components
  const parseTime = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string') {
      return { hour: '12', minute: '00', period: 'AM' };
    }
    
    // Handle 24-hour format (HH:MM)
    const parts = timeStr.split(':');
    let hour = parseInt(parts[0]) || 0;
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
  
  // Convert 12-hour components back to 24-hour format (HH:MM)
  const formatTime = (hour, minute, period) => {
    let h = parseInt(hour) || 12;
    let m = parseInt(minute) || 0;
    
    if (period === 'AM' && h === 12) h = 0;
    if (period === 'PM' && h !== 12) h += 12;
    
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  // Format time for display (12-hour format)
  const formatDisplayTime = (timeStr) => {
    if (!timeStr) return '';
    const { hour, minute, period } = parseTime(timeStr);
    return `${hour}:${minute} ${period}`;
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
    
    // Allow typing and update display immediately
    if (inputValue === '') {
      setLocalValue('');
      onChange?.('');
      return;
    }

    // Try to parse various time formats
    const formatted = parseDirectInput(inputValue);
    if (formatted) {
      setLocalValue(formatted);
      onChange?.(formatted);
    }
  };

  const parseDirectInput = (input) => {
    if (!input) return '';
    
    // Remove extra spaces and normalize
    const cleaned = input.trim().toLowerCase();
    
    // Match 12-hour format with AM/PM (e.g., "2:30 pm", "02:30pm", "2:30p")
    const match12 = cleaned.match(/^(\d{1,2}):?(\d{0,2})\s*(am?|pm?)?$/);
    if (match12) {
      let [, h, m, periodStr] = match12;
      
      h = parseInt(h) || 1;
      m = m ? parseInt(m) : 0;
      
      // Validate ranges
      if (h < 1 || h > 12 || m < 0 || m > 59) return null;
      
      // Determine period
      let detectedPeriod = period; // Use current period as default
      if (periodStr) {
        detectedPeriod = periodStr.startsWith('a') ? 'AM' : 'PM';
      }
      
      return formatTime(h, m.toString().padStart(2, '0'), detectedPeriod);
    }
    
    // Match 24-hour format (e.g., "14:30", "1430")
    const match24 = cleaned.match(/^(\d{1,2}):?(\d{2})$/);
    if (match24) {
      let [, h, m] = match24;
      h = parseInt(h);
      m = parseInt(m);
      
      if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      }
    }
    
    return null;
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setIsOpen(!isOpen);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // Generate hour options (1-12)
  const hourOptions = Array.from({ length: 12 }, (_, i) => i + 1);
  
  // Generate minute options (00, 05, 10, ..., 55)
  const minuteOptions = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
    <div className="relative">
        <input
            ref={inputRef}
            type="text"
            value={formatDisplayTime(localValue)}
            onChange={handleDirectInput}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            {...props} />
        <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
            <ApperIcon name="Clock" size={16} />
        </button>
    </div>
    {isOpen && <div
        className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
        <div className="grid grid-cols-3 gap-4">
            {/* Hour Selection */}
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Hour</label>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                    {hourOptions.map(h => <button
                        key={h}
                        type="button"
                        onClick={() => handleHourChange(h)}
                        className={`w-full text-left px-2 py-1 rounded text-sm transition-colors ${parseInt(hour) === h ? "bg-primary text-white" : "hover:bg-gray-100"}`}>
                        {h}
                    </button>)}
                </div>
            </div>
            {/* Minute Selection */}
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Minute</label>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                    {minuteOptions.map(m => <button
                        key={m}
                        type="button"
                        onClick={() => handleMinuteChange(m)}
                        className={`w-full text-left px-2 py-1 rounded text-sm transition-colors ${minute === m ? "bg-primary text-white" : "hover:bg-gray-100"}`}>
                        {m}
                    </button>)}
                </div>
            </div>
            {/* AM/PM Selection */}
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Period</label>
                <div className="space-y-1">
                    {["AM", "PM"].map(p => <button
                        key={p}
                        type="button"
                        onClick={() => handlePeriodChange(p)}
                        className={`w-full text-left px-2 py-1 rounded text-sm transition-colors ${period === p ? "bg-primary text-white" : "hover:bg-gray-100"}`}>
                        {p}
                    </button>)}
                </div>
            </div>
        </div>
        <div className="mt-4 pt-3 border-t border-gray-200 flex justify-end">
            <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary/90 transition-colors">Done
                            </button>
        </div>
    </div>}
</div>
  );
});

TimeInput.displayName = 'TimeInput';

export default TimeInput;