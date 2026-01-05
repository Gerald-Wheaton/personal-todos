'use client';

import { useState, useTransition } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import ColorPicker from '@/components/ui/ColorPicker';
import { createCategory } from '@/app/actions/categories';
import { THEME_COLORS } from '@/lib/constants';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CategoryModal({ isOpen, onClose }: CategoryModalProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(THEME_COLORS.categoryPresets[0].value);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Category name is required');
      return;
    }

    startTransition(async () => {
      const result = await createCategory({
        name: name.trim(),
        color,
      });

      if (result.success) {
        setName('');
        setColor(THEME_COLORS.categoryPresets[0].value);
        setError('');
        onClose();
      } else {
        setError(result.error || 'Failed to create category');
      }
    });
  };

  const handleClose = () => {
    if (!isPending) {
      setName('');
      setColor(THEME_COLORS.categoryPresets[0].value);
      setError('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Category">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category Name
          </label>
          <Input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            placeholder="e.g., Work, Personal, Shopping"
            error={error}
            disabled={isPending}
            autoFocus
          />
        </div>

        <ColorPicker value={color} onChange={setColor} />

        <div className="flex gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isPending}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isPending || !name.trim()}
            className="flex-1"
          >
            {isPending ? 'Creating...' : 'Create Category'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
