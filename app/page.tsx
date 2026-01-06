import { db } from '@/db';
import { categories, todos } from '@/db/schema';
import { desc, asc, isNull } from 'drizzle-orm';
import Header from '@/components/layout/Header';
import ViewContainer from '@/components/view/ViewContainer';
import QuickAddTodo from '@/components/todo/QuickAddTodo';

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

  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
      <Header categories={categoriesWithTodos} />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <ViewContainer
          categoriesWithTodos={categoriesWithTodos}
          uncategorizedTodos={uncategorizedTodos}
        />
      </div>

      {/* Quick add todo floating button */}
      <QuickAddTodo />
    </main>
  );
}
