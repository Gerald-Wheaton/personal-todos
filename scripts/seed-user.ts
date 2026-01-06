import { db } from '../db';
import { users, categories } from '../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function seedUser() {
  try {
    console.log('🌱 Seeding Gerald user...');

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.username, 'Gerald'),
    });

    if (existingUser) {
      console.log('✅ User "Gerald" already exists with ID:', existingUser.id);

      // Update existing categories to belong to Gerald
      const allCategories = await db.query.categories.findMany();
      const categoriesToUpdate = allCategories.filter((cat) => !cat.userId);

      if (categoriesToUpdate.length > 0) {
        console.log(`📝 Updating ${categoriesToUpdate.length} existing categories...`);

        for (const cat of categoriesToUpdate) {
          await db
            .update(categories)
            .set({ userId: existingUser.id })
            .where(eq(categories.id, cat.id));
        }

        console.log('✅ Categories updated successfully');
      } else {
        console.log('ℹ️  All categories already have a user');
      }

      return;
    }

    // Create Gerald user
    const hashedPassword = await bcrypt.hash('123456', 10);

    const [newUser] = await db
      .insert(users)
      .values({
        username: 'Gerald',
        password: hashedPassword,
      })
      .returning();

    console.log('✅ User "Gerald" created with ID:', newUser.id);

    // Update all existing categories to belong to Gerald
    const allCategories = await db.query.categories.findMany();

    if (allCategories.length > 0) {
      console.log(`📝 Assigning ${allCategories.length} existing categories to Gerald...`);

      for (const cat of allCategories) {
        await db
          .update(categories)
          .set({ userId: newUser.id })
          .where(eq(categories.id, cat.id));
      }

      console.log('✅ All categories assigned to Gerald');
    }

    console.log('🎉 Seeding complete!');
  } catch (error) {
    console.error('❌ Error seeding user:', error);
    process.exit(1);
  }

  process.exit(0);
}

seedUser();
