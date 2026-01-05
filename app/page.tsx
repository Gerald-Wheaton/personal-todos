import { db } from '@/db';
import { categories, todos } from '@/db/schema';
import { desc, asc, eq, isNull } from 'drizzle-orm';
import CategorySection from '@/components/category/CategorySection';
import AddCategoryButton from '@/components/category/AddCategoryButton';
import Header from '@/components/layout/Header';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Fetch all categories with their todos
  const categoriesWithTodos = await db.query.categories.findMany({
    orderBy: [asc(categories.order), desc(categories.createdAt)],
    with: {
      todos: {
        orderBy: [asc(todos.order), desc(todos.createdAt)],
      },
    },
  });

  // Fetch uncategorized todos
  const uncategorizedTodos = await db
    .select()
    .from(todos)
    .where(isNull(todos.categoryId))
    .orderBy(asc(todos.order), desc(todos.createdAt));

  const hasUncategorized = uncategorizedTodos.length > 0;
  const hasCategories = categoriesWithTodos.length > 0;

  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
      <Header categories={categoriesWithTodos} />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Uncategorized todos section (Inbox) */}
        {hasUncategorized && (
          <CategorySection
            category={{
              id: 0,
              name: 'Inbox',
              color: '#9CA3AF',
              icon: null,
              order: 0,
              isCollapsed: false,
              createdAt: new Date(),
              updatedAt: new Date(),
            }}
            todos={uncategorizedTodos}
          />
        )}

        {/* Category sections */}
        {categoriesWithTodos.map((category) => (
          <CategorySection
            key={category.id}
            category={category}
            todos={category.todos}
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
      </div>
    </main>
  );
}
