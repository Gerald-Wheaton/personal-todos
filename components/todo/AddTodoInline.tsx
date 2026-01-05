'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Calendar } from 'lucide-react';
import { createTodo } from '@/app/actions/todos';
import DatePicker from '@/components/ui/DatePicker';

interface AddTodoInlineProps {
  categoryId?: number | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function AddTodoInline({
  categoryId,
  onCancel,
  onSuccess,
}: AddTodoInlineProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    if (!title.trim()) return;

    startTransition(async () => {
      const result = await createTodo({
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate,
        categoryId: categoryId || null,
      });

      if (result.success) {
        onSuccess();
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border-2 border-purple-200"
    >
      <div className="space-y-3">
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Task title..."
          className="w-full px-3 py-2 bg-white border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
          disabled={isPending}
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Description (optional)..."
          rows={2}
          className="w-full px-3 py-2 bg-white border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all resize-none"
          disabled={isPending}
        />

        {showDatePicker && (
          <DatePicker
            value={dueDate}
            onChange={setDueDate}
            placeholder="Select due date"
          />
        )}

        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
            type="button"
          >
            <Calendar size={16} />
            {dueDate ? formatDateShort(dueDate) : 'Set due date'}
          </button>

          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isPending}
              type="button"
            >
              <X size={20} />
            </button>
            <button
              onClick={handleSubmit}
              disabled={!title.trim() || isPending}
              className="p-2 text-white bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors"
              type="button"
            >
              <Check size={20} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function formatDateShort(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}
