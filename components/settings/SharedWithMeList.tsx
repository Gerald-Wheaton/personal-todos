'use client';

import { Category, CategoryShare, User } from '@/db/schema';
import { Users, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface SharedWithMeListProps {
  shares: (CategoryShare & { category: Category & { user: User } })[];
}

export default function SharedWithMeList({ shares }: SharedWithMeListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Categories Shared With Me</h2>
        <p className="text-sm text-gray-600">
          {shares.length} {shares.length === 1 ? 'category' : 'categories'}
        </p>
      </div>

      {shares.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Users size={48} className="mx-auto mb-3 text-gray-300" />
          <p>No categories have been shared with you yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {shares.map((share) => (
            <div
              key={share.id}
              className="border border-purple-100 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: share.category.color }}
                  />
                  <div>
                    <h3 className="font-semibold text-gray-800">{share.category.name}</h3>
                    <p className="text-xs text-gray-500">
                      Shared by <span className="font-medium">{share.category.user.username}</span>
                      {' • '}
                      {share.permission} access
                    </p>
                  </div>
                </div>
                <Link
                  href={`/todo/${share.category.id}`}
                  className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                  aria-label="Open category"
                >
                  <ExternalLink size={18} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
