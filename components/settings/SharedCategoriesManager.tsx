'use client';

import { useState } from 'react';
import { Category, CategoryShare, User } from '@/db/schema';
import { Share2, UserX, Plus, AlertCircle, ExternalLink } from 'lucide-react';
import { revokeShare, shareCategory } from '@/app/actions/shares';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface SharedCategoriesManagerProps {
  categories: (Category & { shares: (CategoryShare & { sharedWithUser: User })[] })[];
}

export default function SharedCategoriesManager({ categories }: SharedCategoriesManagerProps) {
  const router = useRouter();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleShare() {
    if (!selectedCategory) return;

    setError('');
    setIsLoading(true);

    const result = await shareCategory({
      categoryId: selectedCategory.id,
      username,
      permission: 'read',
    });

    if (result.success) {
      setIsShareModalOpen(false);
      setUsername('');
      router.refresh();
    } else {
      setError(result.error || 'Failed to share category');
    }

    setIsLoading(false);
  }

  async function handleRevokeShare(shareId: number) {
    if (!confirm('Are you sure you want to revoke access?')) return;

    const result = await revokeShare(shareId);

    if (result.success) {
      router.refresh();
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Shared Categories</h2>
        <p className="text-sm text-gray-600">Manage who has access to your categories</p>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Share2 size={48} className="mx-auto mb-3 text-gray-300" />
          <p>You haven&apos;t created any categories yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="border border-purple-100 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }} />
                  <h3 className="font-semibold text-gray-800">{category.name}</h3>
                  <Link
                    href={`/todo/${category.id}`}
                    className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    aria-label="View category todos"
                  >
                    <ExternalLink size={16} />
                  </Link>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setSelectedCategory(category);
                    setIsShareModalOpen(true);
                  }}
                >
                  <Plus size={16} className="mr-1" />
                  Share
                </Button>
              </div>

              {category.shares.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs text-gray-600 uppercase tracking-wide mb-2">
                    Shared with ({category.shares.length})
                  </p>
                  {category.shares.map((share) => (
                    <div
                      key={share.id}
                      className="flex items-center justify-between bg-purple-50 rounded-lg p-3"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {share.sharedWithUser.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {share.sharedWithUser.username}
                          </p>
                          <p className="text-xs text-gray-500">{share.permission} access</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRevokeShare(share.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="Revoke access"
                      >
                        <UserX size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">Not shared with anyone</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Share Modal */}
      <Modal
        isOpen={isShareModalOpen}
        onClose={() => {
          setIsShareModalOpen(false);
          setUsername('');
          setError('');
        }}
        title={`Share "${selectedCategory?.name}"`}
      >
        <div className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <Input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username to share with"
              disabled={isLoading}
            />
            <p className="mt-2 text-xs text-gray-500">
              The user will get read access to this category
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                setIsShareModalOpen(false);
                setUsername('');
                setError('');
              }}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={handleShare} disabled={isLoading || !username} className="flex-1">
              {isLoading ? 'Sharing...' : 'Share'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
