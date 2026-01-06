import { pgTable, serial, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(), // Hashed password
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Categories table
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  color: text('color').notNull(), // Hex color for category
  icon: text('icon'), // Optional icon name
  order: integer('order').notNull().default(0), // For custom ordering
  isCollapsed: boolean('is_collapsed').notNull().default(false), // Persist collapse state
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
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
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  order: integer('order').notNull().default(0), // For drag-and-drop ordering within category
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
});

// Assignees table
export const assignees = pgTable('assignees', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  color: text('color').notNull(), // Hex color for assignee
  categoryId: integer('category_id').references(() => categories.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Todo-Assignee junction table (many-to-many)
export const todoAssignees = pgTable('todo_assignees', {
  todoId: integer('todo_id').notNull().references(() => todos.id, { onDelete: 'cascade' }),
  assigneeId: integer('assignee_id').notNull().references(() => assignees.id, { onDelete: 'cascade' }),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  categories: many(categories),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, {
    fields: [categories.userId],
    references: [users.id],
  }),
  todos: many(todos),
  assignees: many(assignees),
}));

export const todosRelations = relations(todos, ({ one, many }) => ({
  category: one(categories, {
    fields: [todos.categoryId],
    references: [categories.id],
  }),
  user: one(users, {
    fields: [todos.userId],
    references: [users.id],
  }),
  todoAssignees: many(todoAssignees),
}));

export const assigneesRelations = relations(assignees, ({ one, many }) => ({
  category: one(categories, {
    fields: [assignees.categoryId],
    references: [categories.id],
  }),
  todoAssignees: many(todoAssignees),
}));

export const todoAssigneesRelations = relations(todoAssignees, ({ one }) => ({
  todo: one(todos, {
    fields: [todoAssignees.todoId],
    references: [todos.id],
  }),
  assignee: one(assignees, {
    fields: [todoAssignees.assigneeId],
    references: [assignees.id],
  }),
}));

// TypeScript types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Todo = typeof todos.$inferSelect;
export type NewTodo = typeof todos.$inferInsert;
export type Assignee = typeof assignees.$inferSelect;
export type NewAssignee = typeof assignees.$inferInsert;
export type TodoAssignee = typeof todoAssignees.$inferSelect;
export type NewTodoAssignee = typeof todoAssignees.$inferInsert;
