'use client';

import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CategoryHeader from './CategoryHeader';
import TodoList from '@/components/todo/TodoList';
import AddTodoInline from '@/components/todo/AddTodoInline';
import { updateCategory } from '@/app/actions/categories';
import type { Category, Todo } from '@/db/schema';

interface CategorySectionProps {
  category: Category;
  todos: Todo[];
}

export default function CategorySection({
  category,
  todos,
}: CategorySectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(category.isCollapsed);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isPending, startTransition] = useTransition();

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState); // Optimistic update

    startTransition(async () => {
      await updateCategory(category.id, { isCollapsed: newState });
    });
  };

  const completedCount = todos.filter((t) => t.isCompleted).length;

  return (
    <motion.section
      layout
      className="mb-6 rounded-2xl bg-white/60 backdrop-blur-sm shadow-lg border border-purple-100 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <CategoryHeader
        category={category}
        todoCount={todos.length}
        completedCount={completedCount}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
      />

      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="p-4 space-y-2">
              <TodoList todos={todos} />

              {showAddForm ? (
                <AddTodoInline
                  categoryId={category.id}
                  onCancel={() => setShowAddForm(false)}
                  onSuccess={() => setShowAddForm(false)}
                />
              ) : (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="w-full py-2 px-4 text-left text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                >
                  + Add task
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
