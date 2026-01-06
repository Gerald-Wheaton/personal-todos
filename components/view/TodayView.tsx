'use client';

import { motion } from 'framer-motion';
import TodoItem from '@/components/todo/TodoItem';
import type { Category, Todo } from '@/db/schema';

interface TodoWithCategory extends Todo {
  category?: Category | null;
}

interface TodayViewProps {
  categoriesWithTodos: (Category & { todos: Todo[] })[];
  uncategorizedTodos: Todo[];
}

export default function TodayView({
  categoriesWithTodos,
  uncategorizedTodos,
}: TodayViewProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Filter todos that are due today
  const allTodos: TodoWithCategory[] = [
    ...uncategorizedTodos.map((todo) => ({ ...todo, category: null })),
    ...categoriesWithTodos.flatMap((cat) =>
      cat.todos.map((todo) => ({ ...todo, category: cat }))
    ),
  ];

  const todayTodos = allTodos.filter((todo) => {
    if (!todo.dueDate) return false;
    const dueDate = new Date(todo.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() === today.getTime();
  });

  return (
    <div className="space-y-4">
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-100 p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Today's Tasks</h2>
          <p className="text-sm text-gray-500 mt-1">
            {today.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {todayTodos.length === 0 ? (
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-gray-500">No tasks scheduled for today</p>
          </div>
        ) : (
          <div className="space-y-2">
            {todayTodos.map((todo) => (
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
