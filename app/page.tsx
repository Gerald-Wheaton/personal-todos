import { db } from '@/db';
import { categories, todos, categoryShares } from '@/db/schema';
import { desc, asc, isNull, eq, and, inArray } from 'drizzle-orm';
import Header from '@/components/layout/Header';
import ViewContainer from '@/components/view/ViewContainer';
import QuickAddTodo from '@/components/todo/QuickAddTodo';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user's categories with their incomplete todos only
  const categoriesWithTodos = await db.query.categories.findMany({
    where: eq(categories.userId, user.id),
    orderBy: [asc(categories.order), desc(categories.createdAt)],
    with: {
      todos: {
        where: eq(todos.isCompleted, false),
        orderBy: [asc(todos.order), desc(todos.createdAt)],
      },
    },
  });

  // Fetch categories shared with the user
  const sharedCategoryIds = await db
    .select({ categoryId: categoryShares.categoryId })
    .from(categoryShares)
    .where(eq(categoryShares.sharedWithUserId, user.id));

  const sharedCategories = sharedCategoryIds.length > 0
    ? await db.query.categories.findMany({
        where: inArray(categories.id, sharedCategoryIds.map(({ categoryId }) => categoryId)),
        with: {
          todos: {
            where: eq(todos.isCompleted, false),
            orderBy: [asc(todos.order), desc(todos.createdAt)],
          },
          user: true, // Include owner info for shared categories
        },
      })
    : [];

  // Fetch uncategorized incomplete todos only for current user
  const uncategorizedTodos = await db
    .select()
    .from(todos)
    .where(
      and(
        isNull(todos.categoryId),
        eq(todos.isCompleted, false),
        eq(todos.userId, user.id)
      )
    )
    .orderBy(asc(todos.order), desc(todos.createdAt));

  // Fetch user's categories with their completed todos for History view
  const categoriesWithCompletedTodos = await db.query.categories.findMany({
    where: eq(categories.userId, user.id),
    orderBy: [asc(categories.order), desc(categories.createdAt)],
    with: {
      todos: {
        where: eq(todos.isCompleted, true),
        orderBy: [desc(todos.completedAt)],
      },
    },
  });

  // Fetch uncategorized completed todos for current user
  const uncategorizedCompletedTodos = await db
    .select()
    .from(todos)
    .where(
      and(
        isNull(todos.categoryId),
        eq(todos.isCompleted, true),
        eq(todos.userId, user.id)
      )
    )
    .orderBy(desc(todos.completedAt));

  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
      <Header categories={categoriesWithTodos} user={user} />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <ViewContainer
          categoriesWithTodos={categoriesWithTodos}
          sharedCategories={sharedCategories}
          uncategorizedTodos={uncategorizedTodos}
          categoriesWithCompletedTodos={categoriesWithCompletedTodos}
          uncategorizedCompletedTodos={uncategorizedCompletedTodos}
        />
      </div>

      {/* Quick add todo floating button */}
      <QuickAddTodo />
    </main>
  );
}
