'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { todos } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { createTodoSchema, updateTodoSchema } from '@/lib/validations';
import type { CreateTodoInput, UpdateTodoInput } from '@/lib/validations';
import { getCurrentUser } from '@/lib/auth';

export async function createTodo(input: CreateTodoInput) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const validated = createTodoSchema.parse(input);

    const [newTodo] = await db.insert(todos).values({
      ...validated,
      dueDate: validated.dueDate || null,
      categoryId: validated.categoryId || null,
      userId: user.id,
    }).returning();

    revalidatePath('/');
    return { success: true, data: newTodo };
  } catch (error) {
    console.error('Error creating todo:', error);
    return { success: false, error: 'Failed to create todo' };
  }
}

export async function updateTodo(id: number, input: UpdateTodoInput) {
  try {
    const validated = updateTodoSchema.parse(input);

    const updateData: any = { ...validated };

    // If marking as completed, set completedAt
    if (validated.isCompleted !== undefined) {
      updateData.completedAt = validated.isCompleted ? new Date() : null;
    }

    updateData.updatedAt = new Date();

    const [updated] = await db
      .update(todos)
      .set(updateData)
      .where(eq(todos.id, id))
      .returning();

    revalidatePath('/');
    return { success: true, data: updated };
  } catch (error) {
    console.error('Error updating todo:', error);
    return { success: false, error: 'Failed to update todo' };
  }
}

export async function deleteTodo(id: number) {
  try {
    await db.delete(todos).where(eq(todos.id, id));
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error deleting todo:', error);
    return { success: false, error: 'Failed to delete todo' };
  }
}

export async function toggleTodo(id: number, isCompleted: boolean) {
  return updateTodo(id, { isCompleted });
}
