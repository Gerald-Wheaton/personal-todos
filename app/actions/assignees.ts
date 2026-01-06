'use server';

import { db } from '@/db';
import { assignees, todoAssignees } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import type { NewAssignee } from '@/db/schema';

export async function createAssignee(data: NewAssignee) {
  try {
    const [assignee] = await db.insert(assignees).values(data).returning();
    revalidatePath(`/todo/${data.categoryId}`);
    return { success: true, assignee };
  } catch (error) {
    console.error('Failed to create assignee:', error);
    return { success: false, error: 'Failed to create assignee' };
  }
}

export async function deleteAssignee(id: number) {
  try {
    const assignee = await db.query.assignees.findFirst({
      where: eq(assignees.id, id),
    });

    if (!assignee) {
      return { success: false, error: 'Assignee not found' };
    }

    await db.delete(assignees).where(eq(assignees.id, id));
    revalidatePath(`/todo/${assignee.categoryId}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to delete assignee:', error);
    return { success: false, error: 'Failed to delete assignee' };
  }
}

export async function assignTodoToAssignee(todoId: number, assigneeId: number) {
  try {
    await db.insert(todoAssignees).values({ todoId, assigneeId });
    revalidatePath('/todo/[id]', 'page');
    return { success: true };
  } catch (error) {
    console.error('Failed to assign todo:', error);
    return { success: false, error: 'Failed to assign todo' };
  }
}

export async function unassignTodoFromAssignee(todoId: number, assigneeId: number) {
  try {
    await db
      .delete(todoAssignees)
      .where(and(eq(todoAssignees.todoId, todoId), eq(todoAssignees.assigneeId, assigneeId)));
    revalidatePath('/todo/[id]', 'page');
    return { success: true };
  } catch (error) {
    console.error('Failed to unassign todo:', error);
    return { success: false, error: 'Failed to unassign todo' };
  }
}
