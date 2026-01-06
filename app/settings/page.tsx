import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import SettingsView from '@/components/settings/SettingsView';
import { getOwnedCategoriesWithShares, getSharedWithMeCategories } from '@/app/actions/shares';
import Header from '@/components/layout/Header';
import { db } from '@/db';
import { categories, todos } from '@/db/schema';
import { desc, asc, eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch categories for header
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

  // Fetch sharing data
  const ownedCategoriesResult = await getOwnedCategoriesWithShares();
  const sharedWithMeResult = await getSharedWithMeCategories();

  const ownedCategories = ownedCategoriesResult.success ? ownedCategoriesResult.data : [];
  const sharedWithMe = sharedWithMeResult.success ? sharedWithMeResult.data : [];

  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
      <Header categories={categoriesWithTodos} user={user} />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <SettingsView
          user={user}
          ownedCategories={ownedCategories}
          sharedWithMe={sharedWithMe}
        />
      </div>
    </main>
  );
}
