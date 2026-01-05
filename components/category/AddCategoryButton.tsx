'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import CategoryModal from './CategoryModal';

export default function AddCategoryButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full mt-6 py-4 px-6 bg-white/60 backdrop-blur-sm border-2 border-dashed border-purple-300 rounded-2xl text-purple-600 font-medium hover:bg-purple-50 hover:border-purple-400 transition-all flex items-center justify-center gap-2 group"
      >
        <Plus
          size={20}
          className="group-hover:scale-110 transition-transform"
        />
        Add Category
      </button>

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
