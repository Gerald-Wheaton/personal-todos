'use client';

import { useState } from 'react';
import { CheckSquare, Sparkles } from 'lucide-react';
import AITodoGenerator from '@/components/ai/AITodoGenerator';
import type { Category } from '@/db/schema';

interface HeaderProps {
  categories: Category[];
}

export default function Header({ categories }: HeaderProps) {
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-purple-100 shadow-sm">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                <CheckSquare size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Todos
                </h1>
                <p className="text-sm text-gray-500">Stay organized, stay productive</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsAIModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <Sparkles size={18} />
                <span className="hidden sm:inline">AI Generate</span>
              </button>

              <div className="text-right hidden sm:block">
                <p className="text-sm text-gray-500">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <AITodoGenerator
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        existingCategories={categories}
      />
    </>
  );
}
