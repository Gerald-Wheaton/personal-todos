'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CategoryHeader from './CategoryHeader';
import TodoList from '@/components/todo/TodoList';
import AddTodoInline from '@/components/todo/AddTodoInline';
import type { Category, Todo } from '@/db/schema';

interface CategorySectionProps {
  category: Category;
  todos: Todo[];
  openAccordionId?: number | null;
  onAccordionToggle?: (id: number | null) => void;
}

export default function CategorySection({
  category,
  todos,
  openAccordionId,
  onAccordionToggle,
}: CategorySectionProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const addFormRef = useRef<HTMLDivElement>(null);

  // Simple boolean: is this accordion open?
  const isOpen = openAccordionId === category.id;

  const toggleCollapse = () => {
    if (onAccordionToggle) {
      // If this accordion is open, close it; otherwise, open it
      onAccordionToggle(isOpen ? null : category.id);
    }
  };

  const handleAddTask = () => {
    // If accordion is closed, open it first
    if (!isOpen && onAccordionToggle) {
      onAccordionToggle(category.id);
    }
    setShowAddForm(true);
  };

  // Scroll to form when it opens
  useEffect(() => {
    if (showAddForm && isOpen && addFormRef.current) {
      setTimeout(() => {
        addFormRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }, 300); // Wait for accordion animation
    }
  }, [showAddForm, isOpen]);

  const completedCount = todos.filter((t) => t.isCompleted).length;

  return (
    <section className="mb-6 rounded-2xl bg-white/60 backdrop-blur-sm shadow-lg border border-purple-100 overflow-hidden">

      <CategoryHeader
        category={category}
        todoCount={todos.length}
        completedCount={completedCount}
        isCollapsed={!isOpen}
        onToggleCollapse={toggleCollapse}
        onAddTask={handleAddTask}
      />

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <div className="p-4 space-y-2">
              <TodoList todos={todos} />

              {showAddForm && (
                <div ref={addFormRef}>
                  <AddTodoInline
                    categoryId={category.id}
                    onCancel={() => setShowAddForm(false)}
                    onSuccess={() => setShowAddForm(false)}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
