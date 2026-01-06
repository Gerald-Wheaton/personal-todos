'use client';

import { useState } from 'react';
import ViewSwitcher, { type ViewType } from '@/components/layout/ViewSwitcher';
import CategorySection from '@/components/category/CategorySection';
import AddCategoryButton from '@/components/category/AddCategoryButton';
import OverviewView from './OverviewView';
import TodayView from './TodayView';
import HistoryView from './HistoryView';
import type { Category, Todo } from '@/db/schema';

interface ViewContainerProps {
  categoriesWithTodos: (Category & { todos: Todo[] })[];
  uncategorizedTodos: Todo[];
}

export default function ViewContainer({
  categoriesWithTodos,
  uncategorizedTodos,
}: ViewContainerProps) {
  const [currentView, setCurrentView] = useState<ViewType>('categories');
  const [openAccordionId, setOpenAccordionId] = useState<number | null>(null);

  const hasUncategorized = uncategorizedTodos.length > 0;
  const hasCategories = categoriesWithTodos.length > 0;

  return (
    <>
      {/* View Switcher */}
      <div className="mb-6 flex justify-center">
        <ViewSwitcher
          currentView={currentView}
          onViewChange={setCurrentView}
        />
      </div>

      {/* Render based on current view */}
      <div className="min-h-[60vh]">
      {currentView === 'categories' && (
        <>
          {/* Uncategorized todos section (Miscellaneous) */}
          {hasUncategorized && (
            <CategorySection
              category={{
                id: 0,
                name: 'Miscellaneous',
                color: '#9CA3AF',
                icon: null,
                order: 0,
                isCollapsed: false,
                createdAt: new Date(),
                updatedAt: new Date(),
              }}
              todos={uncategorizedTodos}
              openAccordionId={openAccordionId}
              onAccordionToggle={setOpenAccordionId}
            />
          )}

          {/* Category sections */}
          {categoriesWithTodos.map((category) => (
            <CategorySection
              key={category.id}
              category={category}
              todos={category.todos}
              openAccordionId={openAccordionId}
              onAccordionToggle={setOpenAccordionId}
            />
          ))}

          {/* Add category button */}
          <AddCategoryButton />

          {/* Empty state */}
          {!hasCategories && !hasUncategorized && (
            <div className="text-center py-16">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 rounded-full mb-4">
                  <svg
                    className="w-10 h-10 text-purple-600"
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
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Welcome to Todos!
                </h2>
                <p className="text-gray-600 mb-6">
                  Get started by creating your first category
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {currentView === 'overview' && (
        <OverviewView
          categoriesWithTodos={categoriesWithTodos}
          uncategorizedTodos={uncategorizedTodos}
        />
      )}

      {currentView === 'today' && (
        <TodayView
          categoriesWithTodos={categoriesWithTodos}
          uncategorizedTodos={uncategorizedTodos}
        />
      )}

      {currentView === 'history' && (
        <HistoryView
          categoriesWithTodos={categoriesWithTodos}
          uncategorizedTodos={uncategorizedTodos}
        />
      )}
      </div>
    </>
  );
}
