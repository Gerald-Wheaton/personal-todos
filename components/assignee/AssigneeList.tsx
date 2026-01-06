'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { createAssignee, deleteAssignee } from '@/app/actions/assignees';
import { THEME_COLORS } from '@/lib/constants';
import type { Assignee } from '@/db/schema';

interface AssigneeListProps {
  assignees: Assignee[];
  categoryId: number;
}

export default function AssigneeList({
  assignees,
  categoryId,
}: AssigneeListProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAssigneeName, setNewAssigneeName] = useState('');
  const [selectedColor, setSelectedColor] = useState(
    THEME_COLORS.categoryPresets[0].value
  );

  const handleAddAssignee = async () => {
    if (!newAssigneeName.trim()) return;

    await createAssignee({
      name: newAssigneeName.trim(),
      color: selectedColor,
      categoryId,
    });

    setNewAssigneeName('');
    setShowAddForm(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Remove this assignee? They will be unassigned from all todos.')) {
      await deleteAssignee(id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Assignees</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
        >
          <Plus size={18} />
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-lg p-4 border border-purple-200 space-y-3">
          <input
            type="text"
            value={newAssigneeName}
            onChange={(e) => setNewAssigneeName(e.target.value)}
            placeholder="Assignee name..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
          />

          <div className="grid grid-cols-4 gap-2">
            {THEME_COLORS.categoryPresets.slice(0, 8).map((preset) => (
              <button
                key={preset.value}
                onClick={() => setSelectedColor(preset.value)}
                className={`w-full aspect-square rounded-lg transition-all ${
                  selectedColor === preset.value
                    ? 'ring-2 ring-purple-600 ring-offset-2'
                    : ''
                }`}
                style={{ backgroundColor: preset.value }}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowAddForm(false)}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddAssignee}
              disabled={!newAssigneeName.trim()}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {assignees.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No assignees yet
          </p>
        ) : (
          assignees.map((assignee) => (
            <div
              key={assignee.id}
              className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 group hover:border-purple-300 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex-shrink-0"
                  style={{ backgroundColor: assignee.color }}
                />
                <span className="font-medium text-gray-800">
                  {assignee.name}
                </span>
              </div>
              <button
                onClick={() => handleDelete(assignee.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-red-600 hover:bg-red-50 rounded transition-all"
              >
                <X size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
