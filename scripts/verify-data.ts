import { db } from '../db';
import { users, categories } from '../db/schema';
import { eq, isNull } from 'drizzle-orm';

async function verifyData() {
  try {
    console.log('🔍 Verifying data ownership...\n');

    // Check if Gerald exists
    const gerald = await db.query.users.findFirst({
      where: eq(users.username, 'Gerald'),
    });

    if (!gerald) {
      console.error('❌ User "Gerald" not found!');
      process.exit(1);
    }

    console.log('✅ User "Gerald" found with ID:', gerald.id);
    console.log('');

    // Check all categories
    const allCategories = await db.query.categories.findMany();
    const categoriesWithoutUser = allCategories.filter((cat) => !cat.userId);
    const categoriesWithGerald = allCategories.filter((cat) => cat.userId === gerald.id);
    const categoriesWithOtherUsers = allCategories.filter(
      (cat) => cat.userId && cat.userId !== gerald.id
    );

    console.log('📊 Category Statistics:');
    console.log(`  Total categories: ${allCategories.length}`);
    console.log(`  Categories assigned to Gerald: ${categoriesWithGerald.length}`);
    console.log(`  Categories without user: ${categoriesWithoutUser.length}`);
    console.log(`  Categories with other users: ${categoriesWithOtherUsers.length}`);
    console.log('');

    if (categoriesWithoutUser.length > 0) {
      console.log('⚠️  Found categories without user assignment. Assigning to Gerald...');

      for (const cat of categoriesWithoutUser) {
        await db
          .update(categories)
          .set({ userId: gerald.id })
          .where(eq(categories.id, cat.id));

        console.log(`  ✓ Assigned category "${cat.name}" (ID: ${cat.id}) to Gerald`);
      }

      console.log('');
    }

    // Final verification
    const finalCategories = await db.query.categories.findMany();
    const allAssignedToGerald = finalCategories.every((cat) => cat.userId === gerald.id);

    if (allAssignedToGerald) {
      console.log('✅ All categories are now assigned to Gerald!');
    } else {
      console.log('⚠️  Some categories are still not assigned to Gerald');
    }

    console.log('');
    console.log('📋 Category List:');
    for (const cat of finalCategories) {
      const userName =
        cat.userId === gerald.id ? 'Gerald' : cat.userId ? `User ${cat.userId}` : 'UNASSIGNED';
      console.log(`  - ${cat.name} (ID: ${cat.id}) → ${userName}`);
    }

    console.log('');
    console.log('🎉 Verification complete!');
  } catch (error) {
    console.error('❌ Error verifying data:', error);
    process.exit(1);
  }

  process.exit(0);
}

verifyData();
