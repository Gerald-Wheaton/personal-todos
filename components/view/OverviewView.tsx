'use client';

import { motion } from 'framer-motion';
import TodoItem from '@/components/todo/TodoItem';
import type { Category, Todo } from '@/db/schema';

interface TodoWithCategory extends Todo {
  category?: Category | null;
}

interface OverviewViewProps {
  categoriesWithTodos: (Category & { todos: Todo[] })[];
  uncategorizedTodos: Todo[];
}

export default function OverviewView({
  categoriesWithTodos,
  uncategorizedTodos,
}: OverviewViewProps) {
  // Flatten all incomplete todos with their category info
  const allTodos: TodoWithCategory[] = [
    ...uncategorizedTodos.filter(todo => !todo.isCompleted).map((todo) => ({ ...todo, category: null })),
    ...categoriesWithTodos.flatMap((cat) =>
      cat.todos.filter(todo => !todo.isCompleted).map((todo) => ({ ...todo, category: cat }))
    ),
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-100 p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">All Tasks</h2>
        {allTodos.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No tasks yet</p>
        ) : (
          <div className="space-y-2">
            {allTodos.map((todo) => (
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
