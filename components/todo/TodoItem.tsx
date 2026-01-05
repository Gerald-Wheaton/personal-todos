'use client';

import { useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Calendar } from 'lucide-react';
import { updateTodo, deleteTodo } from '@/app/actions/todos';
import { formatDate } from '@/lib/utils';
import TodoCheckbox from './TodoCheckbox';
import type { Todo } from '@/db/schema';

interface TodoItemProps {
  todo: Todo;
}

export default function TodoItem({ todo }: TodoItemProps) {
  const [isCompleted, setIsCompleted] = useState(todo.isCompleted);
  const [isPending, startTransition] = useTransition();

  const handleToggleComplete = () => {
    const newState = !isCompleted;
    setIsCompleted(newState); // Optimistic update

    startTransition(async () => {
      const result = await updateTodo(todo.id, { isCompleted: newState });
      if (!result.success) {
        // Revert on error
        setIsCompleted(!newState);
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      await deleteTodo(todo.id);
    });
  };

  const isOverdue =
    todo.dueDate &&
    new Date(todo.dueDate) < new Date() &&
    !isCompleted;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -100, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={`group flex items-start gap-3 p-3 rounded-lg hover:bg-purple-50/50 transition-colors ${
        isPending ? 'opacity-50' : ''
      }`}
    >
      <TodoCheckbox
        checked={isCompleted}
        onChange={handleToggleComplete}
        disabled={isPending}
      />

      <div className="flex-1 min-w-0">
        <h3
          className={`font-medium transition-all ${
            isCompleted ? 'line-through text-gray-400' : 'text-gray-800'
          }`}
        >
          {todo.title}
        </h3>

        {todo.description && (
          <p
            className={`text-sm mt-1 transition-all ${
              isCompleted ? 'line-through text-gray-300' : 'text-gray-600'
            }`}
          >
            {todo.description}
          </p>
        )}

        {todo.dueDate && (
          <div
            className={`flex items-center gap-1 mt-2 text-xs ${
              isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'
            }`}
          >
            <Calendar size={12} />
            {formatDate(todo.dueDate)}
          </div>
        )}
      </div>

      <button
        onClick={handleDelete}
        disabled={isPending}
        className="opacity-0 group-hover:opacity-100 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:cursor-not-allowed"
        aria-label="Delete todo"
      >
        <Trash2 size={16} />
      </button>
    </motion.div>
  );
}
