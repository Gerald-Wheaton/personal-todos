import { db } from '../db';
import { users, todos } from '../db/schema';
import { eq, isNull } from 'drizzle-orm';

async function assignTodosToGerald() {
  try {
    console.log('🔧 Assigning todos to Gerald...\n');

    // Find Gerald
    const gerald = await db.query.users.findFirst({
      where: eq(users.username, 'Gerald'),
    });

    if (!gerald) {
      console.error('❌ User "Gerald" not found!');
      process.exit(1);
    }

    console.log('✅ Found Gerald with ID:', gerald.id);
    console.log('');

    // Get all todos
    const allTodos = await db.query.todos.findMany();
    const todosWithoutUser = allTodos.filter((todo) => !todo.userId);

    console.log('📊 Todo Statistics:');
    console.log(`  Total todos: ${allTodos.length}`);
    console.log(`  Todos without user: ${todosWithoutUser.length}`);
    console.log('');

    if (todosWithoutUser.length > 0) {
      console.log('⚙️  Assigning todos to Gerald...');

      for (const todo of todosWithoutUser) {
        await db.update(todos).set({ userId: gerald.id }).where(eq(todos.id, todo.id));

        const categoryInfo = todo.categoryId ? `in category ${todo.categoryId}` : 'uncategorized';
        console.log(`  ✓ "${todo.title}" (${categoryInfo})`);
      }

      console.log('');
    }

    // Final verification
    const finalTodos = await db.query.todos.findMany();
    const allAssignedToGerald = finalTodos.every((todo) => todo.userId === gerald.id);

    if (allAssignedToGerald) {
      console.log('✅ All todos are now assigned to Gerald!');
    } else {
      const unassigned = finalTodos.filter((todo) => todo.userId !== gerald.id);
      console.log(`⚠️  ${unassigned.length} todos are still not assigned to Gerald`);
    }

    console.log('');
    console.log('🎉 Assignment complete!');
  } catch (error) {
    console.error('❌ Error assigning todos:', error);
    process.exit(1);
  }

  process.exit(0);
}

assignTodosToGerald();
