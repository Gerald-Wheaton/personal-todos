"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Users, Group, Home } from "lucide-react";
import Link from "next/link";
import { getLightColor } from "@/lib/utils";
import TodoList from "./TodoList";
import AddTodoInline from "./AddTodoInline";
import AssigneeList from "@/components/assignee/AssigneeList";
import type { Category, Todo, Assignee } from "@/db/schema";

interface SharedTodoViewProps {
  category: Category;
  todos: any[];
  assignees: Assignee[];
  permission?: string;
}

export default function SharedTodoView({
  category,
  todos,
  assignees,
  permission = 'read',
}: SharedTodoViewProps) {
  const router = useRouter();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showMobileAssignees, setShowMobileAssignees] = useState(false);
  const [groupByAssignee, setGroupByAssignee] = useState(false);
  const isReadOnly = permission === 'read';
  const completedCount = todos.filter((t) => t.isCompleted).length;
  const lightColor = getLightColor(category.color);
  const completionPercentage =
    todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0;

  return (
    <>
      {/* Read-only banner */}
      {isReadOnly && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
          <p className="text-center text-sm text-blue-700">
            You have read-only access to this category
          </p>
        </div>
      )}

      <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        {/* Back home button */}
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
        >
          <Home size={20} />
          <span className="hidden sm:inline">Back to Home</span>
        </Link>

        {/* Mobile assignees toggle */}
        <button
          onClick={() => setShowMobileAssignees(!showMobileAssignees)}
          className="lg:hidden flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Users size={18} />
          <span>Assignees</span>
        </button>
      </div>

      <div className="flex gap-6">
        {/* Main content */}
        <div className="flex-1 max-w-3xl">
          {/* Category Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white/60 backdrop-blur-sm shadow-lg border border-purple-100 overflow-hidden"
          >
            {/* Category Header */}
            <div
              className="px-6 py-4"
              style={{
                background: `linear-gradient(135deg, ${lightColor} 0%, white 100%)`,
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  {/* Color indicator */}
                  <div
                    className="w-1 h-8 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />

                  {/* Category info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-bold text-gray-800">
                        {category.name}
                      </h1>
                      <span className="text-sm text-gray-500">
                        {completedCount}/{todos.length}
                      </span>
                    </div>

                    {/* Progress bar */}
                    {todos.length > 0 && (
                      <div className="mt-2 w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${completionPercentage}%` }}
                          transition={{ duration: 0.3 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  {/* Group by assignee button */}
                  {assignees.length > 0 && (
                    <button
                      onClick={() => setGroupByAssignee(!groupByAssignee)}
                      className={`p-2 rounded-lg transition-colors ${
                        groupByAssignee
                          ? 'bg-purple-600 text-white'
                          : 'text-purple-600 hover:bg-purple-50'
                      }`}
                      aria-label="Group by assignee"
                    >
                      <Group size={20} />
                    </button>
                  )}

                  {/* Add Task button */}
                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    aria-label="Add task"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Todos List */}
            <div className="p-4 space-y-2">
              {showAddForm && (
                <AddTodoInline
                  categoryId={category.id}
                  onCancel={() => setShowAddForm(false)}
                  onSuccess={() => setShowAddForm(false)}
                />
              )}

              {todos.length === 0 && !showAddForm ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No tasks in this category yet</p>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Add your first task
                  </button>
                </div>
              ) : (
                <TodoList
                  todos={todos}
                  assignees={assignees}
                  groupByAssignee={groupByAssignee}
                />
              )}
            </div>
          </motion.div>
        </div>

        {/* Desktop Assignees Sidebar */}
        <aside className="hidden lg:block w-80 flex-shrink-0">
          <div className="sticky top-8">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-100 p-6">
              <AssigneeList assignees={assignees} categoryId={category.id} />
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile Assignees Modal */}
      <AnimatePresence>
        {showMobileAssignees && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setShowMobileAssignees(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-800">Assignees</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Tap outside to close
                </p>
              </div>
              <AssigneeList assignees={assignees} categoryId={category.id} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </>
  );
}
