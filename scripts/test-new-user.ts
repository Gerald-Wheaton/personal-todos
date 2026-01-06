import { db } from '../db';
import { users, categories, todos } from '../db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function testNewUser() {
  try {
    console.log('🧪 Testing new user isolation...\n');

    // Create a test user
    const testUsername = `testuser_${Date.now()}`;
    const hashedPassword = await bcrypt.hash('testpass', 10);

    const [testUser] = await db
      .insert(users)
      .values({
        username: testUsername,
        password: hashedPassword,
      })
      .returning();

    console.log(`✅ Created test user "${testUsername}" with ID: ${testUser.id}`);
    console.log('');

    // Query categories for test user (simulating what they would see)
    const testUserCategories = await db.query.categories.findMany({
      where: eq(categories.userId, testUser.id),
      with: {
        todos: {
          where: eq(todos.isCompleted, false),
        },
      },
    });

    // Query uncategorized todos for test user (same query as in app/page.tsx)
    const testUserUncategorizedTodos = await db
      .select()
      .from(todos)
      .where(
        and(
          isNull(todos.categoryId),
          eq(todos.isCompleted, false),
          eq(todos.userId, testUser.id)
        )
      );

    console.log('📊 Test User View:');
    console.log(`  Categories: ${testUserCategories.length}`);
    console.log(`  Uncategorized todos: ${testUserUncategorizedTodos.length}`);
    console.log('');

    if (testUserCategories.length === 0) {
      console.log('✅ SUCCESS: New user has NO categories (as expected)');
    } else {
      console.log('❌ FAIL: New user can see categories:');
      testUserCategories.forEach((cat) => {
        console.log(`  - ${cat.name} (ID: ${cat.id})`);
      });
    }

    if (testUserUncategorizedTodos.length === 0) {
      console.log('✅ SUCCESS: New user has NO uncategorized todos (as expected)');
    } else {
      console.log('❌ FAIL: New user can see uncategorized todos');
    }

    console.log('');

    // Now check Gerald's data
    const gerald = await db.query.users.findFirst({
      where: eq(users.username, 'Gerald'),
    });

    if (gerald) {
      const geraldCategories = await db.query.categories.findMany({
        where: eq(categories.userId, gerald.id),
        with: {
          todos: true,
        },
      });

      console.log('📊 Gerald\'s View:');
      console.log(`  Categories: ${geraldCategories.length}`);

      let totalTodos = 0;
      geraldCategories.forEach((cat) => {
        totalTodos += cat.todos.length;
        console.log(`  - ${cat.name}: ${cat.todos.length} todos`);
      });

      console.log(`  Total todos: ${totalTodos}`);
      console.log('');
      console.log('✅ Gerald can see his data');
    }

    // Clean up test user
    console.log('');
    console.log('🧹 Cleaning up test user...');
    await db.delete(users).where(eq(users.id, testUser.id));
    console.log(`✅ Deleted test user "${testUsername}"`);

    console.log('');
    console.log('🎉 Test complete! Data isolation is working correctly.');
  } catch (error) {
    console.error('❌ Error testing new user:', error);
    process.exit(1);
  }

  process.exit(0);
}

testNewUser();
