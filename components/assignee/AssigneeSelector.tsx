'use client';

import { useState, useEffect, useRef } from 'react';
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
  const [positionAbove, setPositionAbove] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isHoveringButtonRef = useRef(false);
  const isHoveringDropdownRef = useRef(false);

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

  const clearCloseTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const scheduleClose = () => {
    clearCloseTimeout();
    // Schedule close after a delay - long enough to move from button to dropdown
    timeoutRef.current = setTimeout(() => {
      // Double-check we're not hovering either element before closing (using refs for current state)
      if (!isHoveringButtonRef.current && !isHoveringDropdownRef.current) {
        setShowDropdown(false);
      }
    }, 200);
  };

  const handleButtonMouseEnter = () => {
    if (!isMobile) {
      isHoveringButtonRef.current = true;
      clearCloseTimeout();
      // Always show dropdown when hovering button
      setShowDropdown(true);
    }
  };

  const handleButtonMouseLeave = (e: React.MouseEvent) => {
    if (!isMobile) {
      // Check if mouse is moving to the dropdown first
      const relatedTarget = e.relatedTarget as Node | null;
      if (dropdownRef.current && relatedTarget && dropdownRef.current.contains(relatedTarget)) {
        // Mouse is moving to dropdown, keep button hover state until dropdown takes over
        return;
      }
      
      isHoveringButtonRef.current = false;
      // Schedule close - if mouse enters dropdown, it will cancel
      scheduleClose();
    }
  };

  const handleDropdownMouseEnter = () => {
    if (!isMobile) {
      isHoveringDropdownRef.current = true;
      clearCloseTimeout();
      // Ensure dropdown stays open
      if (!showDropdown) {
        setShowDropdown(true);
      }
    }
  };

  const handleDropdownMouseLeave = (e: React.MouseEvent) => {
    if (!isMobile) {
      isHoveringDropdownRef.current = false;
      // Check if mouse is moving to the button
      const relatedTarget = e.relatedTarget as Node | null;
      if (buttonRef.current && relatedTarget && buttonRef.current.contains(relatedTarget)) {
        // Mouse is moving to button, don't close
        return;
      }
      // Close immediately when leaving dropdown (mouse is moving away from both)
      clearCloseTimeout();
      setShowDropdown(false);
    }
  };

  // Calculate dropdown position when it opens
  useEffect(() => {
    if (showDropdown && containerRef.current && dropdownRef.current && !isMobile) {
      // Use requestAnimationFrame to ensure dropdown is rendered
      requestAnimationFrame(() => {
        if (!containerRef.current || !dropdownRef.current) return;
        
        const containerRect = containerRef.current.getBoundingClientRect();
        const dropdownRect = dropdownRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        const spaceBelow = viewportHeight - containerRect.bottom;
        const spaceAbove = containerRect.top;
        const dropdownHeight = dropdownRect.height;
        const requiredSpace = dropdownHeight + 8; // mt-2 = 8px
        
        // Position above if not enough space below, but enough space above
        if (spaceBelow < requiredSpace && spaceAbove > spaceBelow) {
          setPositionAbove(true);
        } else {
          setPositionAbove(false);
        }
      });
    }
  }, [showDropdown, isMobile, availableAssignees.length]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

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
      ref={containerRef}
      className="relative"
    >
      <button
        ref={buttonRef}
        onClick={handleClick}
        onMouseEnter={handleButtonMouseEnter}
        onMouseLeave={handleButtonMouseLeave}
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
          {/* Backdrop - only for mobile clicks, not hover */}
          {isMobile && (
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowDropdown(false)}
            />
          )}

          {/* Dropdown */}
          <div
            ref={dropdownRef}
            className={`absolute right-0 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20 min-w-[200px] ${
              positionAbove ? 'bottom-full mb-2' : 'top-full mt-2'
            }`}
            onMouseEnter={handleDropdownMouseEnter}
            onMouseLeave={handleDropdownMouseLeave}
          >
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
