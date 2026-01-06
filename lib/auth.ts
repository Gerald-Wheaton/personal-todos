import { cookies } from 'next/headers';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

const SESSION_COOKIE_NAME = 'session';
const PENDING_CATEGORY_COOKIE = 'pending_category_id';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createSession(userId: number) {
  const cookieStore = await cookies();
  // Store user ID in cookie (in production, use encrypted JWT)
  cookieStore.set(SESSION_COOKIE_NAME, userId.toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
  });
}

export async function getSession(): Promise<number | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME);

  if (!session?.value) {
    return null;
  }

  const userId = parseInt(session.value);

  // Verify user still exists
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  return user ? userId : null;
}

export async function getCurrentUser() {
  const userId = await getSession();

  if (!userId) {
    return null;
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  return user || null;
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function setPendingCategory(categoryId: number) {
  const cookieStore = await cookies();
  cookieStore.set(PENDING_CATEGORY_COOKIE, categoryId.toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60, // 1 hour
    path: '/',
  });
}

export async function getPendingCategory(): Promise<number | null> {
  const cookieStore = await cookies();
  const pending = cookieStore.get(PENDING_CATEGORY_COOKIE);
  return pending?.value ? parseInt(pending.value) : null;
}

export async function clearPendingCategory() {
  const cookieStore = await cookies();
  cookieStore.delete(PENDING_CATEGORY_COOKIE);
}
