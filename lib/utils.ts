import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date for display
export function formatDate(date: Date | null): string {
  if (!date) return '';

  const now = new Date();
  const targetDate = new Date(date);
  const diff = targetDate.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days === -1) return 'Yesterday';
  if (days < -1) return `${Math.abs(days)} days ago`;
  if (days > 1 && days <= 7) return `In ${days} days`;

  return targetDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: targetDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

// Get lighter version of color for backgrounds
export function getLightColor(hexColor: string): string {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  // Make it much lighter (closer to white)
  const lighten = (c: number) => Math.round(c + (255 - c) * 0.85);

  return `#${lighten(r).toString(16).padStart(2, '0')}${lighten(g).toString(16).padStart(2, '0')}${lighten(b).toString(16).padStart(2, '0')}`;
}

// Sort todos by due date first (nulls last), then alphabetically by title
export function sortTodosByDueDateThenTitle<T extends { dueDate?: Date | string | null; title: string }>(todos: T[]): T[] {
  return [...todos].sort((a, b) => {
    // First, sort by due date
    const aDueDate = a.dueDate ? new Date(a.dueDate).getTime() : null;
    const bDueDate = b.dueDate ? new Date(b.dueDate).getTime() : null;

    // If both have due dates, sort by date (earlier first)
    if (aDueDate !== null && bDueDate !== null) {
      if (aDueDate !== bDueDate) {
        return aDueDate - bDueDate;
      }
    }
    // If only one has a due date, that one comes first
    else if (aDueDate !== null && bDueDate === null) {
      return -1;
    }
    else if (aDueDate === null && bDueDate !== null) {
      return 1;
    }
    // If both are null, continue to title sorting

    // Then sort alphabetically by title
    return a.title.localeCompare(b.title);
  });
}
