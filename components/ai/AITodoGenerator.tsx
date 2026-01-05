'use client';

import { useState, useTransition } from 'react';
import { Sparkles, Loader2, Plus, Trash2, Edit3 } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import DatePicker from '@/components/ui/DatePicker';
import ColorPicker from '@/components/ui/ColorPicker';
import { generateTodosWithAI, type AiGeneratedTodo } from '@/app/actions/ai';
import { createTodo } from '@/app/actions/todos';
import { createCategory } from '@/app/actions/categories';
import type { Category } from '@/db/schema';
import { THEME_COLORS } from '@/lib/constants';

interface AITodoGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  existingCategories: Category[];
}

interface EditableTodo extends AiGeneratedTodo {
  id: string;
  isEditing: boolean;
}

export default function AITodoGenerator({
  isOpen,
  onClose,
  existingCategories,
}: AITodoGeneratorProps) {
  const [input, setInput] = useState('');
  const [generatedTodos, setGeneratedTodos] = useState<EditableTodo[]>([]);
  const [suggestedCategory, setSuggestedCategory] = useState<{
    name: string;
    color: string;
  } | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [createNewCategory, setCreateNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState(
    THEME_COLORS.categoryPresets[0].value
  );
  const [error, setError] = useState('');
  const [step, setStep] = useState<'input' | 'edit' | 'category'>('input');
  const [isPending, startTransition] = useTransition();

  const handleGenerate = () => {
    if (!input.trim()) {
      setError('Please enter some text to generate todos');
      return;
    }

    setError('');
    startTransition(async () => {
      const result = await generateTodosWithAI(input.trim());

      if (result.success && result.data) {
        const todos: EditableTodo[] = result.data.todos.map((todo, idx) => ({
          ...todo,
          id: `${Date.now()}-${idx}`,
          isEditing: false,
        }));
        setGeneratedTodos(todos);

        if (result.data.categoryName) {
          setSuggestedCategory({
            name: result.data.categoryName,
            color: result.data.categoryColor || THEME_COLORS.categoryPresets[0].value,
          });
          setNewCategoryName(result.data.categoryName);
          setNewCategoryColor(
            result.data.categoryColor || THEME_COLORS.categoryPresets[0].value
          );
        }

        setStep('edit');
      } else {
        setError(result.error || 'Failed to generate todos');
      }
    });
  };

  const handleUpdateTodo = (id: string, updates: Partial<EditableTodo>) => {
    setGeneratedTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, ...updates } : todo
      )
    );
  };

  const handleDeleteTodo = (id: string) => {
    setGeneratedTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  const handleSaveTodos = async () => {
    if (generatedTodos.length === 0) {
      setError('No todos to save');
      return;
    }

    startTransition(async () => {
      let categoryId: number | null = selectedCategoryId;

      // Create new category if needed
      if (createNewCategory) {
        if (!newCategoryName.trim()) {
          setError('Category name is required');
          return;
        }

        const categoryResult = await createCategory({
          name: newCategoryName.trim(),
          color: newCategoryColor,
        });

        if (!categoryResult.success) {
          setError(categoryResult.error || 'Failed to create category');
          return;
        }

        categoryId = categoryResult.data!.id;
      }

      // Save all todos
      const promises = generatedTodos.map((todo) =>
        createTodo({
          title: todo.title,
          description: todo.description,
          dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
          categoryId,
        })
      );

      const results = await Promise.all(promises);
      const failures = results.filter((r) => !r.success);

      if (failures.length > 0) {
        setError(`Failed to save ${failures.length} todo(s)`);
      } else {
        handleClose();
      }
    });
  };

  const handleClose = () => {
    setInput('');
    setGeneratedTodos([]);
    setSuggestedCategory(null);
    setSelectedCategoryId(null);
    setCreateNewCategory(false);
    setNewCategoryName('');
    setNewCategoryColor(THEME_COLORS.categoryPresets[0].value);
    setError('');
    setStep('input');
    onClose();
  };

  const goToCategory = () => {
    setStep('category');
  };

  const goBackToEdit = () => {
    setStep('edit');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <div className="flex items-center gap-2">
          <Sparkles className="text-purple-600" size={24} />
          <span>AI Todo Generator</span>
        </div>
      }
    >
      {step === 'input' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Describe a project, paste a list of tasks, or type anything - AI will break
            it down into actionable todos.
          </p>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Example: Plan a birthday party for Sarah next weekend&#10;Or: Build a landing page with hero section, features, testimonials, and contact form&#10;Or: Just paste your scattered thoughts..."
            rows={8}
            className="w-full px-4 py-3 bg-white border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all resize-none"
            disabled={isPending}
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

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
              type="button"
              variant="primary"
              onClick={handleGenerate}
              disabled={isPending || !input.trim()}
              className="flex-1 flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Generate Todos
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {step === 'edit' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Review and edit your todos before saving
            </p>
            <button
              onClick={() => setStep('input')}
              className="text-sm text-purple-600 hover:text-purple-700"
            >
              ← Back to input
            </button>
          </div>

          {suggestedCategory && (
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-900 mb-1">
                <strong>Suggested Category:</strong> {suggestedCategory.name}
              </p>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: suggestedCategory.color }}
                />
                <p className="text-xs text-purple-700">
                  You can save these as a new category or add to an existing one
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {generatedTodos.map((todo) => (
              <div
                key={todo.id}
                className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200"
              >
                {todo.isEditing ? (
                  <div className="space-y-2">
                    <Input
                      type="text"
                      value={todo.title}
                      onChange={(e) =>
                        handleUpdateTodo(todo.id, { title: e.target.value })
                      }
                      placeholder="Todo title"
                    />
                    <textarea
                      value={todo.description || ''}
                      onChange={(e) =>
                        handleUpdateTodo(todo.id, {
                          description: e.target.value,
                        })
                      }
                      placeholder="Description (optional)"
                      rows={2}
                      className="w-full px-3 py-2 bg-white border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all resize-none text-sm"
                    />
                    <DatePicker
                      value={todo.dueDate ? new Date(todo.dueDate) : undefined}
                      onChange={(date) =>
                        handleUpdateTodo(todo.id, {
                          dueDate: date?.toISOString(),
                        })
                      }
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="primary"
                        onClick={() => handleUpdateTodo(todo.id, { isEditing: false })}
                      >
                        Done
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{todo.title}</h4>
                      {todo.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {todo.description}
                        </p>
                      )}
                      {todo.dueDate && (
                        <p className="text-xs text-purple-600 mt-1">
                          Due: {new Date(todo.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleUpdateTodo(todo.id, { isEditing: true })}
                        className="p-1.5 text-gray-600 hover:bg-white rounded transition-colors"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteTodo(todo.id)}
                        className="p-1.5 text-red-600 hover:bg-white rounded transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

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
              type="button"
              variant="primary"
              onClick={goToCategory}
              disabled={generatedTodos.length === 0}
              className="flex-1"
            >
              Next: Choose Category →
            </Button>
          </div>
        </div>
      )}

      {step === 'category' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Where should these {generatedTodos.length} todo(s) be saved?
            </p>
            <button
              onClick={goBackToEdit}
              className="text-sm text-purple-600 hover:text-purple-700"
            >
              ← Back to edit
            </button>
          </div>

          <div className="space-y-3">
            {/* Option 1: Create new category */}
            <div
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                createNewCategory
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
              onClick={() => {
                setCreateNewCategory(true);
                setSelectedCategoryId(null);
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Plus size={18} className="text-purple-600" />
                <h4 className="font-medium">Create New Category</h4>
              </div>
              {createNewCategory && (
                <div className="space-y-3 mt-3">
                  <Input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Category name"
                  />
                  <ColorPicker
                    value={newCategoryColor}
                    onChange={setNewCategoryColor}
                  />
                </div>
              )}
            </div>

            {/* Option 2: Select existing category */}
            <div
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                !createNewCategory
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
              onClick={() => setCreateNewCategory(false)}
            >
              <h4 className="font-medium mb-3">Add to Existing Category</h4>
              {!createNewCategory && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  <button
                    onClick={() => setSelectedCategoryId(null)}
                    className={`w-full p-2 text-left rounded-lg transition-colors ${
                      selectedCategoryId === null
                        ? 'bg-purple-200'
                        : 'bg-white hover:bg-purple-100'
                    }`}
                  >
                    <span className="text-gray-700">Inbox (Uncategorized)</span>
                  </button>
                  {existingCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategoryId(cat.id)}
                      className={`w-full p-2 text-left rounded-lg transition-colors flex items-center gap-2 ${
                        selectedCategoryId === cat.id
                          ? 'bg-purple-200'
                          : 'bg-white hover:bg-purple-100'
                      }`}
                    >
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-gray-700">{cat.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

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
              type="button"
              variant="primary"
              onClick={handleSaveTodos}
              disabled={isPending}
              className="flex-1"
            >
              {isPending ? (
                <>
                  <Loader2 size={18} className="animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                `Save ${generatedTodos.length} Todo(s)`
              )}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
