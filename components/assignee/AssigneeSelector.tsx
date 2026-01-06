'use client';

import { useState, useEffect } from 'react';
import { Check, Users } from 'lucide-react';
import { assignTodoToAssignee, unassignTodoFromAssignee } from '@/app/actions/assignees';
import type { Assignee } from '@/db/schema';

interface AssigneeSelectorProps {
  todoId: number;
  assignedAssigneeIds: number[];
  availableAssignees: Assignee[];
}

export default function AssigneeSelector({
  todoId,
  assignedAssigneeIds,
  availableAssignees,
}: AssigneeSelectorProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const assignedAssignees = availableAssignees.filter((a) =>
    assignedAssigneeIds.includes(a.id)
  );

  const handleToggleAssignee = async (assigneeId: number) => {
    setIsUpdating(true);

    if (assignedAssigneeIds.includes(assigneeId)) {
      await unassignTodoFromAssignee(todoId, assigneeId);
    } else {
      await assignTodoToAssignee(todoId, assigneeId);
    }

    setIsUpdating(false);
  };

  const handleMouseEnter = () => {
    if (!isMobile) {
      setShowDropdown(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setShowDropdown(false);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMobile) {
      setShowDropdown(!showDropdown);
    }
  };

  // Generate gradient for multiple assignees
  const getAssigneeBackground = () => {
    if (assignedAssignees.length === 0) return 'transparent';
    if (assignedAssignees.length === 1) return assignedAssignees[0].color;

    const colors = assignedAssignees.map((a) => a.color).join(', ');
    return `linear-gradient(135deg, ${colors})`;
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={handleClick}
        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors relative"
        disabled={isUpdating}
      >
        {assignedAssignees.length > 0 ? (
          <div
            className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
            style={{ background: getAssigneeBackground() }}
          />
        ) : (
          <Users size={20} className="text-gray-400" />
        )}
      </button>

      {showDropdown && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20 min-w-[200px]">
            <div className="px-3 py-2 border-b border-gray-200">
              <p className="text-xs font-semibold text-gray-600 uppercase">
                Assign to
              </p>
            </div>

            {availableAssignees.length === 0 ? (
              <div className="px-3 py-4 text-sm text-gray-500 text-center">
                No assignees available
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto">
                {availableAssignees.map((assignee) => (
                  <button
                    key={assignee.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleAssignee(assignee.id);
                    }}
                    disabled={isUpdating}
                    className="w-full px-3 py-2 flex items-center gap-3 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <div
                      className="w-6 h-6 rounded-full flex-shrink-0"
                      style={{ backgroundColor: assignee.color }}
                    />
                    <span className="flex-1 text-left text-sm text-gray-800">
                      {assignee.name}
                    </span>
                    {assignedAssigneeIds.includes(assignee.id) && (
                      <Check size={16} className="text-purple-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
