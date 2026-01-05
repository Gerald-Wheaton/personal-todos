'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface TodoCheckboxProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}

export default function TodoCheckbox({ checked, onChange, disabled }: TodoCheckboxProps) {
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      className={`relative flex-shrink-0 w-6 h-6 rounded-md border-2 transition-all ${
        checked
          ? 'bg-purple-600 border-purple-600'
          : 'bg-white border-gray-300 hover:border-purple-400'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      aria-label={checked ? 'Mark as incomplete' : 'Mark as complete'}
    >
      <motion.div
        initial={false}
        animate={{
          scale: checked ? 1 : 0,
          opacity: checked ? 1 : 0,
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <Check size={16} className="text-white" strokeWidth={3} />
      </motion.div>
    </button>
  );
}
