'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Calendar, Edit2, Check, X, MoreVertical } from 'lucide-react';
import { updateTodo, deleteTodo } from '@/app/actions/todos';
import { formatDate } from '@/lib/utils';
import TodoCheckbox from './TodoCheckbox';
import DatePicker from '@/components/ui/DatePicker';
import AssigneeSelector from '@/components/assignee/AssigneeSelector';
import type { Todo, Assignee, Category } from '@/db/schema';

interface TodoItemProps {
  todo: any;
  assignees?: Assignee[];
  category?: Category | null;
}

export default function TodoItem({ todo, assignees = [], category }: TodoItemProps) {
  const [isCompleted, setIsCompleted] = useState(todo.isCompleted);
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(todo.description || '');
  const [editDueDate, setEditDueDate] = useState<Date | undefined>(
    todo.dueDate ? new Date(todo.dueDate) : undefined
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPending, startTransition] = useTransition();
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Extract assigned assignee IDs from todoAssignees
  const assignedAssigneeIds =
    todo.todoAssignees?.map((ta: any) => ta.assigneeId) || [];

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  // Get assignee background for hover (same logic as AssigneeSelector)
  const assignedAssignees = assignees.filter((a) =>
    assignedAssigneeIds.includes(a.id)
  );

  // Convert hex to rgba
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Lighten color for hover states by blending with white
  const lightenColor = (hex: string, amount: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    // Blend with white (255, 255, 255) based on amount (0-1)
    const newR = Math.round(r + (255 - r) * amount);
    const newG = Math.round(g + (255 - g) * amount);
    const newB = Math.round(b + (255 - b) * amount);
    return `rgb(${newR}, ${newG}, ${newB})`;
  };

  const getHoverBackground = () => {
    if (!isHovered) return undefined;

    // No assignees assigned - use purple opaque background
    if (assignees.length === 0 || assignedAssignees.length === 0) {
      return 'rgb(243, 232, 255)'; // purple-100
    }

    if (assignedAssignees.length === 1) {
      // Single assignee - use their color with low opacity
      return hexToRgba(assignedAssignees[0].color, 0.12);
    }

    // Multiple assignees - create gradient with lightened colors
    // Lighten each color by 85% (making them very light tints) for a subtle gradient effect
    const colors = assignedAssignees.map((a) => lightenColor(a.color, 0.85)).join(', ');
    return `linear-gradient(135deg, ${colors})`;
  };

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
      style={{ background: getHoverBackground() }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group flex items-start gap-3 p-3 rounded-lg transition-all ${
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

        {(todo.dueDate || category !== undefined) && (
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {todo.dueDate && (
              <div
                className={`flex items-center gap-1 text-xs ${
                  isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'
                }`}
              >
                <Calendar size={12} />
                {formatDate(todo.dueDate)}
              </div>
            )}
            {category && (
              <span
                className="px-3 py-1 text-xs font-medium rounded-full text-white"
                style={{ backgroundColor: category.color }}
              >
                {category.name}
              </span>
            )}
            {category === null && (
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-400 text-white">
                Miscellaneous
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-1 items-center relative">
        {/* Desktop: Show all buttons on hover */}
        {!isMobile && assignees.length > 0 && (
          <>
            <AssigneeSelector
              todoId={todo.id}
              assignedAssigneeIds={assignedAssigneeIds}
              availableAssignees={assignees}
            />
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
          </>
        )}

        {/* Desktop without assignees: Show edit/delete on hover */}
        {!isMobile && assignees.length === 0 && (
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
        )}

        {/* Mobile: Show menu button */}
        {isMobile && assignees.length > 0 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMobileMenu(!showMobileMenu);
              }}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="More options"
            >
              <MoreVertical size={18} />
            </button>

            {/* Mobile menu dropdown */}
            {showMobileMenu && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMobileMenu(false)}
                />

                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 min-w-[160px]">
                  <div className="flex flex-col">
                    {/* Assignee selector inline */}
                    <div className="px-2 py-1">
                      <AssigneeSelector
                        todoId={todo.id}
                        assignedAssigneeIds={assignedAssigneeIds}
                        availableAssignees={assignees}
                      />
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit();
                        setShowMobileMenu(false);
                      }}
                      disabled={isPending}
                      className="w-full px-4 py-2 flex items-center gap-3 text-left text-purple-600 hover:bg-purple-50 transition-colors disabled:opacity-50"
                    >
                      <Edit2 size={16} />
                      <span className="text-sm">Edit</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete();
                        setShowMobileMenu(false);
                      }}
                      disabled={isPending}
                      className="w-full px-4 py-2 flex items-center gap-3 text-left text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                      <span className="text-sm">Delete</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* Mobile without assignees: Show menu button */}
        {isMobile && assignees.length === 0 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMobileMenu(!showMobileMenu);
              }}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="More options"
            >
              <MoreVertical size={18} />
            </button>

            {/* Mobile menu dropdown */}
            {showMobileMenu && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMobileMenu(false)}
                />

                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 min-w-[160px]">
                  <div className="flex flex-col">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit();
                        setShowMobileMenu(false);
                      }}
                      disabled={isPending}
                      className="w-full px-4 py-2 flex items-center gap-3 text-left text-purple-600 hover:bg-purple-50 transition-colors disabled:opacity-50"
                    >
                      <Edit2 size={16} />
                      <span className="text-sm">Edit</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete();
                        setShowMobileMenu(false);
                      }}
                      disabled={isPending}
                      className="w-full px-4 py-2 flex items-center gap-3 text-left text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                      <span className="text-sm">Delete</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        )}
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
