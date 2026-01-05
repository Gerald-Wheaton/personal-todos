'use client';

import { THEME_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export default function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Category Color
      </label>
      <div className="grid grid-cols-4 gap-3">
        {THEME_COLORS.categoryPresets.map((preset) => (
          <button
            key={preset.value}
            type="button"
            onClick={() => onChange(preset.value)}
            className={cn(
              'relative w-full aspect-square rounded-lg transition-all hover:scale-110',
              'focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2'
            )}
            style={{ backgroundColor: preset.value }}
            title={preset.name}
          >
            {value === preset.value && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Check size={24} className="text-white drop-shadow-lg" strokeWidth={3} />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
