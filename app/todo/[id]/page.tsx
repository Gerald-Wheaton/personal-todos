import { db } from '@/db';
import { categories, todos, assignees, categoryShares } from '@/db/schema';
import { eq, asc, desc, and } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import SharedTodoView from '@/components/todo/SharedTodoView';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SharedTodoPage({ params }: PageProps) {
  const { id } = await params;
  const categoryId = parseInt(id, 10);

  if (isNaN(categoryId)) {
    notFound();
  }

  // Get current user (if any)
  const user = await getCurrentUser();

  // Fetch the category
  const category = await db.query.categories.findFirst({
    where: eq(categories.id, categoryId),
  });

  if (!category) {
    notFound();
  }

  // Check access permissions
  let hasAccess = false;
  let permission = 'none';

  if (user) {
    // Owner always has access
    if (category.userId === user.id) {
      hasAccess = true;
      permission = 'write';
    } else {
      // Check if shared with user
      const share = await db.query.categoryShares.findFirst({
        where: and(
          eq(categoryShares.categoryId, categoryId),
          eq(categoryShares.sharedWithUserId, user.id)
        ),
      });

      if (share) {
        hasAccess = true;
        permission = share.permission;
      }
    }
  }

  // For backward compatibility, allow public access for unauthenticated users
  if (!hasAccess && !user) {
    hasAccess = true;
    permission = 'read';
  }

  if (!hasAccess) {
    notFound();
  }

  // Fetch incomplete todos with their assignees for this category
  const categoryTodos = await db.query.todos.findMany({
    where: and(eq(todos.categoryId, categoryId), eq(todos.isCompleted, false)),
    orderBy: [asc(todos.order), desc(todos.createdAt)],
    with: {
      todoAssignees: {
        with: {
          assignee: true,
        },
      },
    },
  });

  // Fetch assignees for this category
  const categoryAssignees = await db
    .select()
    .from(assignees)
    .where(eq(assignees.categoryId, categoryId))
    .orderBy(asc(assignees.createdAt));

  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
      <SharedTodoView
        category={category}
        todos={categoryTodos}
        assignees={categoryAssignees}
        permission={permission}
      />
    </main>
  );
}
