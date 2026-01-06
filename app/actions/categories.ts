'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { categories } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { createCategorySchema, updateCategorySchema } from '@/lib/validations';
import type { CreateCategoryInput, UpdateCategoryInput } from '@/lib/validations';
import { getCurrentUser } from '@/lib/auth';

export async function createCategory(input: CreateCategoryInput) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const validated = createCategorySchema.parse(input);

    const [newCategory] = await db
      .insert(categories)
      .values({ ...validated, userId: user.id })
      .returning();

    revalidatePath('/');
    return { success: true, data: newCategory };
  } catch (error) {
    console.error('Error creating category:', error);
    return { success: false, error: 'Failed to create category' };
  }
}

export async function updateCategory(id: number, input: UpdateCategoryInput) {
  try {
    const validated = updateCategorySchema.parse(input);

    const [updated] = await db
      .update(categories)
      .set({ ...validated, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();

    revalidatePath('/');
    return { success: true, data: updated };
  } catch (error) {
    console.error('Error updating category:', error);
    return { success: false, error: 'Failed to update category' };
  }
}

export async function deleteCategory(id: number) {
  try {
    await db.delete(categories).where(eq(categories.id, id));
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error deleting category:', error);
    return { success: false, error: 'Failed to delete category' };
  }
}

export async function toggleCategoryCollapse(id: number, isCollapsed: boolean) {
  return updateCategory(id, { isCollapsed });
}
