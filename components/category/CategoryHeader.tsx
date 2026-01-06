'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Share2, Check, ExternalLink, MoreVertical } from 'lucide-react';
import { deleteCategory } from '@/app/actions/categories';
import { getLightColor } from '@/lib/utils';
import type { Category } from '@/db/schema';
import Link from 'next/link';

interface CategoryHeaderProps {
  category: Category;
  todoCount: number;
  completedCount: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onAddTask: () => void;
}

export default function CategoryHeader({
  category,
  todoCount,
  completedCount,
  isCollapsed,
  onToggleCollapse,
  onAddTask,
}: CategoryHeaderProps) {
  const [showCheckmark, setShowCheckmark] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, right: 0 });
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calculate popover position when menu opens
  useEffect(() => {
    if (showMobileMenu && menuButtonRef.current) {
      const rect = menuButtonRef.current.getBoundingClientRect();
      setPopoverPosition({
        top: rect.bottom + 8, // 8px = mt-2 equivalent
        right: window.innerWidth - rect.right,
      });
    }
  }, [showMobileMenu]);

  const handleDelete = async () => {
    if (confirm(`Delete "${category.name}" and all its tasks?`)) {
      await deleteCategory(category.id);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      const url = `${window.location.origin}/todo/${category.id}`;
      await navigator.clipboard.writeText(url);
      setShowCheckmark(true);

      // Revert back to share icon after 2 seconds
      setTimeout(() => {
        setShowCheckmark(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
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

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Desktop: Show all buttons */}
          {!isMobile && (
            <>
              {/* Share button */}
              <button
                onClick={handleShare}
                disabled={showCheckmark}
                className={`p-1.5 sm:p-2 rounded-lg transition-all flex-shrink-0 ${
                  showCheckmark
                    ? 'bg-green-500 text-white cursor-not-allowed'
                    : 'text-blue-600 hover:bg-blue-50'
                }`}
                aria-label="Share category"
              >
                <motion.div
                  key={showCheckmark ? 'check' : 'share'}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {showCheckmark ? <Check size={16} className="sm:w-[18px] sm:h-[18px]" /> : <Share2 size={16} className="sm:w-[18px] sm:h-[18px]" />}
                </motion.div>
              </button>

              {/* Open in dedicated page button */}
              <Link
                href={`/todo/${category.id}`}
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 sm:p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors flex-shrink-0"
                aria-label="Open in dedicated page"
              >
                <ExternalLink size={16} className="sm:w-[18px] sm:h-[18px]" />
              </Link>

              {/* Delete button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                aria-label="Delete category"
              >
                <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
              </button>

              {/* Add Task button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddTask();
                }}
                className="p-1.5 sm:p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors flex-shrink-0"
                aria-label="Add task"
              >
                <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
              </button>
            </>
          )}

          {/* Mobile: Show menu button */}
          {isMobile && (
            <>
              <button
                ref={menuButtonRef}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMobileMenu(!showMobileMenu);
                }}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="More options"
              >
                <MoreVertical size={20} />
              </button>

              {/* Mobile menu popover - rendered via portal */}
              {typeof window !== 'undefined' && createPortal(
                <AnimatePresence>
                  {showMobileMenu && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMobileMenu(false);
                        }}
                      />

                      {/* Popover */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="fixed bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 min-w-[200px]"
                        style={{
                          top: `${popoverPosition.top}px`,
                          right: `${popoverPosition.right}px`,
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Share */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare(e);
                            setShowMobileMenu(false);
                          }}
                          disabled={showCheckmark}
                          className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                          {showCheckmark ? (
                            <>
                              <Check size={18} className="text-green-600" />
                              <span className="text-sm text-green-600 font-medium">Link Copied!</span>
                            </>
                          ) : (
                            <>
                              <Share2 size={18} className="text-blue-600" />
                              <span className="text-sm text-gray-700">Share Category</span>
                            </>
                          )}
                        </button>

                        {/* Open in dedicated page */}
                        <Link
                          href={`/todo/${category.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowMobileMenu(false);
                          }}
                          className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors"
                        >
                          <ExternalLink size={18} className="text-purple-600" />
                          <span className="text-sm text-gray-700">Open Full View</span>
                        </Link>

                        {/* Add Task */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddTask();
                            setShowMobileMenu(false);
                          }}
                          className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors"
                        >
                          <Plus size={18} className="text-purple-600" />
                          <span className="text-sm text-gray-700">Add Task</span>
                        </button>

                        {/* Delete */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete();
                            setShowMobileMenu(false);
                          }}
                          className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={18} className="text-red-600" />
                          <span className="text-sm text-red-600">Delete Category</span>
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>,
                document.body
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
