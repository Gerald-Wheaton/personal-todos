'use client';

import { LayoutGrid, List, Calendar, History } from 'lucide-react';

export type ViewType = 'categories' | 'overview' | 'today' | 'history';

interface ViewSwitcherProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export default function ViewSwitcher({
  currentView,
  onViewChange,
}: ViewSwitcherProps) {
  const views = [
    { id: 'categories' as ViewType, label: 'Categories', icon: LayoutGrid },
    { id: 'overview' as ViewType, label: 'Overview', icon: List },
    { id: 'today' as ViewType, label: 'Today', icon: Calendar },
    { id: 'history' as ViewType, label: 'History', icon: History },
  ];

  return (
    <div className="flex gap-2 p-1 bg-purple-100/50 rounded-lg">
      {views.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onViewChange(id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
            currentView === id
              ? 'bg-white text-purple-600 shadow-sm font-medium'
              : 'text-gray-600 hover:text-purple-600 hover:bg-white/50'
          }`}
        >
          <Icon size={18} />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
