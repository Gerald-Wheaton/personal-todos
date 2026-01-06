'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import AddTodoInline from './AddTodoInline';

export default function QuickAddTodo() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all flex items-center justify-center z-50"
        aria-label="Add new task"
      >
        <Plus size={24} />
      </button>

      {/* Modal for adding todo */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add New Task">
        <AddTodoInline
          categoryId={null}
          onCancel={() => setIsOpen(false)}
          onSuccess={() => setIsOpen(false)}
        />
      </Modal>
    </>
  );
}
