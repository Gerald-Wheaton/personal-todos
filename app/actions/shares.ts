'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { categoryShares, categories, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { shareCategorySchema } from '@/lib/validations';
import type { ShareCategoryInput } from '@/lib/validations';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

export async function shareCategory(input: ShareCategoryInput) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const validated = shareCategorySchema.parse(input);

    // Verify category ownership
    const category = await db.query.categories.findFirst({
      where: eq(categories.id, validated.categoryId),
    });

    if (!category) {
      return { success: false, error: 'Category not found' };
    }

    if (category.userId !== user.id) {
      return { success: false, error: 'You do not own this category' };
    }

    // Find user to share with
    const targetUser = await db.query.users.findFirst({
      where: eq(users.username, validated.username),
    });

    if (!targetUser) {
      return { success: false, error: 'User not found' };
    }

    // Prevent sharing with self
    if (targetUser.id === user.id) {
      return { success: false, error: 'Cannot share with yourself' };
    }

    // Check if already shared
    const existingShare = await db.query.categoryShares.findFirst({
      where: and(
        eq(categoryShares.categoryId, validated.categoryId),
        eq(categoryShares.sharedWithUserId, targetUser.id)
      ),
    });

    if (existingShare) {
      return { success: false, error: 'Already shared with this user' };
    }

    // Create share
    await db.insert(categoryShares).values({
      categoryId: validated.categoryId,
      ownerId: user.id,
      sharedWithUserId: targetUser.id,
      permission: validated.permission,
    });

    revalidatePath('/settings');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('Error sharing category:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'Failed to share category' };
  }
}

export async function revokeShare(shareId: number) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Verify ownership before revoking
    const share = await db.query.categoryShares.findFirst({
      where: eq(categoryShares.id, shareId),
    });

    if (!share) {
      return { success: false, error: 'Share not found' };
    }

    if (share.ownerId !== user.id) {
      return { success: false, error: 'You do not own this share' };
    }

    // Delete share
    await db.delete(categoryShares).where(eq(categoryShares.id, shareId));

    revalidatePath('/settings');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('Error revoking share:', error);
    return { success: false, error: 'Failed to revoke access' };
  }
}

export async function getOwnedCategoriesWithShares() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const ownedCategories = await db.query.categories.findMany({
      where: eq(categories.userId, user.id),
      with: {
        shares: {
          with: {
            sharedWithUser: true,
          },
        },
      },
    });

    return { success: true, data: ownedCategories };
  } catch (error) {
    console.error('Error fetching shared categories:', error);
    return { success: false, error: 'Failed to load shared categories' };
  }
}

export async function getSharedWithMeCategories() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const sharedCategories = await db.query.categoryShares.findMany({
      where: eq(categoryShares.sharedWithUserId, user.id),
      with: {
        category: {
          with: {
            user: true,
          },
        },
      },
    });

    return { success: true, data: sharedCategories };
  } catch (error) {
    console.error('Error fetching shared categories:', error);
    return { success: false, error: 'Failed to load shared categories' };
  }
}
