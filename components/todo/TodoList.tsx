'use client';

import { useMemo, useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import TodoItem from './TodoItem';
import type { Todo, Assignee } from '@/db/schema';

interface TodoListProps {
  todos: any[];
  assignees?: Assignee[];
  groupByAssignee?: boolean;
}

export default function TodoList({ todos, assignees = [], groupByAssignee = false }: TodoListProps) {
  const [openAssigneeGroups, setOpenAssigneeGroups] = useState<Set<number>>(new Set());

  // Reset open groups when grouping is toggled
  useEffect(() => {
    if (!groupByAssignee) {
      setOpenAssigneeGroups(new Set());
    } else {
      // When grouping is enabled, open all groups by default
      setOpenAssigneeGroups(new Set(assignees.map((a) => a.id)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupByAssignee]);

  const toggleAssigneeGroup = (assigneeId: number) => {
    setOpenAssigneeGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(assigneeId)) {
        newSet.delete(assigneeId);
      } else {
        newSet.add(assigneeId);
      }
      return newSet;
    });
  };

  // Sort todos: incomplete first, then completed at the bottom
  const sortedTodos = useMemo(() => {
    return [...todos].sort((a, b) => {
      // If completion status is different, incomplete comes first
      if (a.isCompleted !== b.isCompleted) {
        return a.isCompleted ? 1 : -1;
      }
      // If both have same completion status, maintain original order
      return 0;
    });
  }, [todos]);

  // Group todos by assignee
  const groupedTodos = useMemo(() => {
    if (!groupByAssignee || assignees.length === 0) {
      return null;
    }

    // Create a map of assignee ID to their todos
    const assigneeGroups = new Map<number, any[]>();
    const unassignedTodos: any[] = [];

    sortedTodos.forEach((todo) => {
      const assigneeIds = todo.todoAssignees?.map((ta: any) => ta.assigneeId) || [];

      if (assigneeIds.length === 0) {
        unassignedTodos.push(todo);
      } else {
        // Add todo to each assignee's group
        assigneeIds.forEach((assigneeId: number) => {
          if (!assigneeGroups.has(assigneeId)) {
            assigneeGroups.set(assigneeId, []);
          }
          assigneeGroups.get(assigneeId)!.push(todo);
        });
      }
    });

    return { assigneeGroups, unassignedTodos };
  }, [sortedTodos, groupByAssignee, assignees]);

  if (todos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>No tasks yet. Add one to get started!</p>
      </div>
    );
  }

  // Render grouped view
  if (groupedTodos) {
    return (
      <div className="space-y-4">
        {/* Render each assignee group */}
        {assignees.map((assignee) => {
          const todos = groupedTodos.assigneeGroups.get(assignee.id) || [];
          if (todos.length === 0) return null;

          const isOpen = openAssigneeGroups.has(assignee.id);

          return (
            <div key={assignee.id} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Assignee header - clickable */}
              <button
                onClick={() => toggleAssigneeGroup(assignee.id)}
                className="w-full flex items-center gap-2 p-3 bg-gray-50/50 hover:bg-gray-100/50 transition-colors"
              >
                <ChevronDown
                  size={18}
                  className={`text-gray-600 transition-transform flex-shrink-0 ${
                    isOpen ? '' : '-rotate-90'
                  }`}
                />
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: assignee.color }}
                />
                <h3 className="font-semibold text-gray-700">{assignee.name}</h3>
                <span className="text-xs text-gray-500">({todos.length})</span>
              </button>

              {/* Todos for this assignee - collapsible */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                  >
                    <div className="p-2 space-y-2">
                      <AnimatePresence mode="popLayout">
                        {todos.map((todo) => (
                          <TodoItem
                            key={todo.id}
                            todo={todo}
                            assignees={assignees}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {/* Unassigned todos */}
        {groupedTodos.unassignedTodos.length > 0 && (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleAssigneeGroup(-1)} // Use -1 for unassigned
              className="w-full flex items-center gap-2 p-3 bg-gray-50/50 hover:bg-gray-100/50 transition-colors"
            >
              <ChevronDown
                size={18}
                className={`text-gray-600 transition-transform flex-shrink-0 ${
                  openAssigneeGroups.has(-1) ? '' : '-rotate-90'
                }`}
              />
              <div className="w-4 h-4 rounded-full bg-gray-300 flex-shrink-0" />
              <h3 className="font-semibold text-gray-700">Unassigned</h3>
              <span className="text-xs text-gray-500">
                ({groupedTodos.unassignedTodos.length})
              </span>
            </button>

            <AnimatePresence initial={false}>
              {openAssigneeGroups.has(-1) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                >
                  <div className="p-2 space-y-2">
                    <AnimatePresence mode="popLayout">
                      {groupedTodos.unassignedTodos.map((todo) => (
                        <TodoItem
                          key={todo.id}
                          todo={todo}
                          assignees={assignees}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    );
  }

  // Render regular flat view
  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {sortedTodos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            assignees={assignees}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
