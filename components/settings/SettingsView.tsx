'use client';

import { useState } from 'react';
import { User, Category, CategoryShare } from '@/db/schema';
import { Settings, Key, Share2, Users } from 'lucide-react';
import PasswordChangeForm from './PasswordChangeForm';
import SharedCategoriesManager from './SharedCategoriesManager';
import SharedWithMeList from './SharedWithMeList';

interface SettingsViewProps {
  user: User;
  ownedCategories: (Category & { shares: (CategoryShare & { sharedWithUser: User })[] })[];
  sharedWithMe: (CategoryShare & { category: Category & { user: User } })[];
}

type Tab = 'password' | 'sharing' | 'shared-with-me';

export default function SettingsView({ user, ownedCategories, sharedWithMe }: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<Tab>('password');

  const tabs = [
    { id: 'password' as Tab, label: 'Password', icon: Key, count: null },
    {
      id: 'sharing' as Tab,
      label: 'My Shares',
      icon: Share2,
      count: ownedCategories.reduce((sum, cat) => sum + cat.shares.length, 0),
    },
    { id: 'shared-with-me' as Tab, label: 'Shared With Me', icon: Users, count: sharedWithMe.length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-100 p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
            <Settings className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
            <p className="text-sm text-gray-600">Manage your account and sharing preferences</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-100 overflow-hidden">
        <div className="flex border-b border-purple-100">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-4 flex items-center justify-center gap-2 transition-all ${
                  activeTab === tab.id
                    ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-600'
                    : 'text-gray-600 hover:bg-purple-25'
                }`}
              >
                <Icon size={18} />
                <span className="font-medium">{tab.label}</span>
                {tab.count !== null && tab.count > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'password' && <PasswordChangeForm />}
          {activeTab === 'sharing' && <SharedCategoriesManager categories={ownedCategories} />}
          {activeTab === 'shared-with-me' && <SharedWithMeList shares={sharedWithMe} />}
        </div>
      </div>
    </div>
  );
}
