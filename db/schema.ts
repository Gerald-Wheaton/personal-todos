import { pgTable, serial, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Categories table
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  color: text('color').notNull(), // Hex color for category
  icon: text('icon'), // Optional icon name
  order: integer('order').notNull().default(0), // For custom ordering
  isCollapsed: boolean('is_collapsed').notNull().default(false), // Persist collapse state
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Todos table
export const todos = pgTable('todos', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  dueDate: timestamp('due_date'),
  isCompleted: boolean('is_completed').notNull().default(false),
  categoryId: integer('category_id').references(() => categories.id, { onDelete: 'cascade' }),
  order: integer('order').notNull().default(0), // For drag-and-drop ordering within category
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
});

// Relations
export const categoriesRelations = relations(categories, ({ many }) => ({
  todos: many(todos),
}));

export const todosRelations = relations(todos, ({ one }) => ({
  category: one(categories, {
    fields: [todos.categoryId],
    references: [categories.id],
  }),
}));

// TypeScript types
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Todo = typeof todos.$inferSelect;
export type NewTodo = typeof todos.$inferInsert;
