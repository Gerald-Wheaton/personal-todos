'use client';

import { motion } from 'framer-motion';
import { ChevronDown, MoreVertical, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { deleteCategory } from '@/app/actions/categories';
import { getLightColor } from '@/lib/utils';
import type { Category } from '@/db/schema';

interface CategoryHeaderProps {
  category: Category;
  todoCount: number;
  completedCount: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function CategoryHeader({
  category,
  todoCount,
  completedCount,
  isCollapsed,
  onToggleCollapse,
}: CategoryHeaderProps) {
  const [showMenu, setShowMenu] = useState(false);

  const handleDelete = async () => {
    if (confirm(`Delete "${category.name}" and all its tasks?`)) {
      await deleteCategory(category.id);
    }
  };

  const lightColor = getLightColor(category.color);
  const completionPercentage =
    todoCount > 0 ? Math.round((completedCount / todoCount) * 100) : 0;

  return (
    <div
      className="relative px-6 py-4 cursor-pointer select-none"
      style={{
        background: `linear-gradient(135deg, ${lightColor} 0%, white 100%)`,
      }}
      onClick={onToggleCollapse}
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
              <h2 className="text-xl font-bold text-gray-800">
                {category.name}
              </h2>
              <span className="text-sm text-gray-500">
                {completedCount}/{todoCount}
              </span>
            </div>

            {/* Progress bar */}
            {todoCount > 0 && (
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

        <div className="flex items-center gap-2">
          {/* More options */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-2 text-gray-600 hover:bg-white/50 rounded-lg transition-colors relative"
          >
            <MoreVertical size={20} />

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[150px]">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            )}
          </button>

          {/* Collapse toggle */}
          <motion.div
            animate={{ rotate: isCollapsed ? -90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={24} className="text-gray-600" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
