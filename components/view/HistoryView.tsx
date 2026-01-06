'use client';

import { motion } from 'framer-motion';
import TodoItem from '@/components/todo/TodoItem';
import type { Category, Todo } from '@/db/schema';

interface TodoWithCategory extends Todo {
  category?: Category | null;
}

interface HistoryViewProps {
  categoriesWithTodos: (Category & { todos: Todo[] })[];
  uncategorizedTodos: Todo[];
}

export default function HistoryView({
  categoriesWithTodos,
  uncategorizedTodos,
}: HistoryViewProps) {
  // Flatten all todos and filter for completed ones
  const allTodos: TodoWithCategory[] = [
    ...uncategorizedTodos.map((todo) => ({ ...todo, category: null })),
    ...categoriesWithTodos.flatMap((cat) =>
      cat.todos.map((todo) => ({ ...todo, category: cat }))
    ),
  ];

  const completedTodos = allTodos
    .filter((todo) => todo.isCompleted)
    .sort((a, b) => {
      // Sort by completion date (most recent first)
      if (!a.completedAt && !b.completedAt) return 0;
      if (!a.completedAt) return 1;
      if (!b.completedAt) return -1;
      return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
    });

  return (
    <div className="space-y-4">
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-100 p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Completed Tasks</h2>
          <p className="text-sm text-gray-500 mt-1">
            {completedTodos.length} task{completedTodos.length !== 1 ? 's' : ''} completed
          </p>
        </div>

        {completedTodos.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <p className="text-gray-500">No completed tasks yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {completedTodos.map((todo) => (
              <motion.div
                key={todo.id}
                layout
                className="relative"
              >
                <TodoItem todo={todo} />
                {todo.category && (
                  <div className="absolute top-3 right-3">
                    <span
                      className="px-3 py-1 text-xs font-medium rounded-full text-white"
                      style={{ backgroundColor: todo.category.color }}
                    >
                      {todo.category.name}
                    </span>
                  </div>
                )}
                {!todo.category && (
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-400 text-white">
                      Miscellaneous
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
