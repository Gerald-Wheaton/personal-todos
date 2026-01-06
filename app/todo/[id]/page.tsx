import { db } from '@/db';
import { categories, todos, assignees } from '@/db/schema';
import { eq, asc, desc, and } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import SharedTodoView from '@/components/todo/SharedTodoView';

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

  // Fetch the category
  const category = await db.query.categories.findFirst({
    where: eq(categories.id, categoryId),
  });

  if (!category) {
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
      />
    </main>
  );
}
