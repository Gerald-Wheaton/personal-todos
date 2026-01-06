'use server';

import { db } from '@/db';
import { users, categories, todos, assignees, todoAssignees } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import {
  hashPassword,
  verifyPassword,
  createSession,
  clearSession,
  getPendingCategory,
  clearPendingCategory,
} from '@/lib/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function signup(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) {
    return { success: false, error: 'Username and password are required' };
  }

  if (username.length < 3) {
    return { success: false, error: 'Username must be at least 3 characters' };
  }

  if (password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters' };
  }

  // Check if user already exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.username, username),
  });

  if (existingUser) {
    return { success: false, error: 'Username already exists' };
  }

  // Create user
  const hashedPassword = await hashPassword(password);
  const [newUser] = await db
    .insert(users)
    .values({
      username,
      password: hashedPassword,
    })
    .returning();

  // Check if there's a pending category to clone
  const pendingCategoryId = await getPendingCategory();

  if (pendingCategoryId) {
    await cloneCategoryForUser(pendingCategoryId, newUser.id);
    await clearPendingCategory();
  }

  // Create session
  await createSession(newUser.id);
  revalidatePath('/');

  return { success: true };
}

export async function login(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) {
    return { success: false, error: 'Username and password are required' };
  }

  // Find user
  const user = await db.query.users.findFirst({
    where: eq(users.username, username),
  });

  if (!user) {
    return { success: false, error: 'Invalid username or password' };
  }

  // Verify password
  const isValid = await verifyPassword(password, user.password);

  if (!isValid) {
    return { success: false, error: 'Invalid username or password' };
  }

  // Create session
  await createSession(user.id);
  revalidatePath('/');

  return { success: true };
}

export async function logout() {
  await clearSession();
  redirect('/login');
}

async function cloneCategoryForUser(categoryId: number, userId: number) {
  // Fetch the original category with todos and assignees
  const originalCategory = await db.query.categories.findFirst({
    where: eq(categories.id, categoryId),
    with: {
      todos: {
        with: {
          todoAssignees: true,
        },
      },
      assignees: true,
    },
  });

  if (!originalCategory) {
    return;
  }

  // Create new category for user
  const [newCategory] = await db
    .insert(categories)
    .values({
      name: originalCategory.name,
      color: originalCategory.color,
      icon: originalCategory.icon,
      order: originalCategory.order,
      isCollapsed: originalCategory.isCollapsed,
      userId,
    })
    .returning();

  // Map old assignee IDs to new assignee IDs
  const assigneeMap = new Map<number, number>();

  // Clone assignees
  for (const assignee of originalCategory.assignees) {
    const [newAssignee] = await db
      .insert(assignees)
      .values({
        name: assignee.name,
        color: assignee.color,
        categoryId: newCategory.id,
      })
      .returning();

    assigneeMap.set(assignee.id, newAssignee.id);
  }

  // Clone todos
  for (const todo of originalCategory.todos) {
    const [newTodo] = await db
      .insert(todos)
      .values({
        title: todo.title,
        description: todo.description,
        dueDate: todo.dueDate,
        isCompleted: todo.isCompleted,
        categoryId: newCategory.id,
        order: todo.order,
        completedAt: todo.completedAt,
      })
      .returning();

    // Clone todo-assignee relationships
    for (const ta of todo.todoAssignees) {
      const newAssigneeId = assigneeMap.get(ta.assigneeId);
      if (newAssigneeId) {
        await db.insert(todoAssignees).values({
          todoId: newTodo.id,
          assigneeId: newAssigneeId,
        });
      }
    }
  }
}
