'use client';

import { cn } from '@/lib/utils';
import { Calendar } from 'lucide-react';
import { forwardRef } from 'react';

interface DatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
}

const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ value, onChange, placeholder = 'Select date', className }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const dateValue = e.target.value;
      onChange(dateValue ? new Date(dateValue) : undefined);
    };

    const formatDateForInput = (date?: Date): string => {
      if (!date) return '';
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    return (
      <div className="relative">
        <input
          ref={ref}
          type="date"
          value={formatDateForInput(value)}
          onChange={handleChange}
          className={cn(
            'w-full px-3 py-2 pr-10 bg-white border border-purple-200 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-purple-400',
            className
          )}
          placeholder={placeholder}
        />
        <Calendar
          size={18}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none"
        />
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';

export default DatePicker;
