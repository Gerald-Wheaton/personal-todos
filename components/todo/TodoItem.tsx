'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Calendar, Edit2, Check, X } from 'lucide-react';
import { updateTodo, deleteTodo } from '@/app/actions/todos';
import { formatDate } from '@/lib/utils';
import TodoCheckbox from './TodoCheckbox';
import DatePicker from '@/components/ui/DatePicker';
import type { Todo } from '@/db/schema';

interface TodoItemProps {
  todo: Todo;
}

export default function TodoItem({ todo }: TodoItemProps) {
  const [isCompleted, setIsCompleted] = useState(todo.isCompleted);
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(todo.description || '');
  const [editDueDate, setEditDueDate] = useState<Date | undefined>(
    todo.dueDate ? new Date(todo.dueDate) : undefined
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isPending, startTransition] = useTransition();
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditing]);

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

  const handleEdit = () => {
    setIsEditing(true);
    setEditTitle(todo.title);
    setEditDescription(todo.description || '');
    setEditDueDate(todo.dueDate ? new Date(todo.dueDate) : undefined);
  };

  const handleSaveEdit = () => {
    if (!editTitle.trim()) return;

    startTransition(async () => {
      const result = await updateTodo(todo.id, {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
        dueDate: editDueDate,
      });

      if (result.success) {
        setIsEditing(false);
      }
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle(todo.title);
    setEditDescription(todo.description || '');
    setEditDueDate(todo.dueDate ? new Date(todo.dueDate) : undefined);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const isOverdue =
    todo.dueDate &&
    new Date(todo.dueDate) < new Date() &&
    !isCompleted;

  // Check if description is long (more than 100 characters on desktop, 50 on mobile)
  const isLongDescription = (todo.description?.length || 0) > 100;

  if (isEditing) {
    return (
      <motion.div
        layout
        className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border-2 border-purple-200"
      >
        <div className="space-y-3">
          <input
            ref={titleInputRef}
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Task title..."
            className="w-full px-3 py-2 bg-white border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
            disabled={isPending}
          />

          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Description (optional)..."
            rows={3}
            className="w-full px-3 py-2 bg-white border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all resize-none"
            disabled={isPending}
          />

          {showDatePicker && (
            <DatePicker
              value={editDueDate}
              onChange={setEditDueDate}
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
              {editDueDate ? formatDateShort(editDueDate) : 'Set due date'}
            </button>

            <div className="flex gap-2">
              <button
                onClick={handleCancelEdit}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={isPending}
                type="button"
              >
                <X size={20} />
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={!editTitle.trim() || isPending}
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

      <div
        className="flex-1 min-w-0 cursor-pointer"
        onClick={() => {
          if (isLongDescription && !isExpanded) {
            setIsExpanded(true);
          }
        }}
      >
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
            } ${
              !isExpanded && isLongDescription
                ? 'line-clamp-2 sm:line-clamp-3'
                : ''
            }`}
          >
            {todo.description}
          </p>
        )}

        {isLongDescription && !isExpanded && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(true);
            }}
            className="text-xs text-purple-600 hover:text-purple-700 mt-1"
          >
            Show more
          </button>
        )}

        {isLongDescription && isExpanded && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(false);
            }}
            className="text-xs text-purple-600 hover:text-purple-700 mt-1"
          >
            Show less
          </button>
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

      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleEdit}
          disabled={isPending}
          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-all disabled:cursor-not-allowed"
          aria-label="Edit todo"
        >
          <Edit2 size={16} />
        </button>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:cursor-not-allowed"
          aria-label="Delete todo"
        >
          <Trash2 size={16} />
        </button>
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
