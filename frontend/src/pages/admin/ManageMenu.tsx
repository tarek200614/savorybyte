import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/services/api';
import { Category, MenuItem } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/feedback/EmptyState';
import { CardSkeleton } from '@/components/feedback/Skeleton';
import { Utensils, Plus, Trash2, Leaf } from 'lucide-react';

/* ─── Schemas ─── */
const categorySchema = z.object({
  name: z.string().min(2, 'Category name is required'),
  description: z.string().optional(),
  display_order: z.coerce.number().min(0),
});

const menuItemSchema = z.object({
  name: z.string().min(2, 'Item name is required'),
  description: z.string().optional(),
  price: z.coerce.number().min(0.01, 'Price must be greater than 0'),
  category_id: z.string().uuid('Select a category'),
  preparation_time_mins: z.coerce.number().min(1),
  is_vegetarian: z.boolean(),
  is_gluten_free: z.boolean(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;
type MenuItemFormValues = z.infer<typeof menuItemSchema>;

export function ManageMenu() {
  const queryClient = useQueryClient();
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);

  /* ─── Queries ─── */
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['admin-categories'],
    queryFn: () => apiRequest<Category[]>('/menu/categories'),
  });

  const { data: menuItems, isLoading } = useQuery<MenuItem[]>({
    queryKey: ['admin-menu-items'],
    queryFn: () => apiRequest<MenuItem[]>('/menu/items'),
  });

  /* ─── Category Form ─── */
  const catForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { display_order: 0 },
  });

  const createCategoryMutation = useMutation({
    mutationFn: (data: CategoryFormValues) =>
      apiRequest<Category>('/menu/categories', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setShowCategoryModal(false);
      catForm.reset();
    },
  });

  /* ─── Menu Item Form ─── */
  const itemForm = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      preparation_time_mins: 15,
      is_vegetarian: false,
      is_gluten_free: false,
    },
  });

  const createItemMutation = useMutation({
    mutationFn: (data: MenuItemFormValues) =>
      apiRequest<MenuItem>('/menu/items', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-menu-items'] });
      setShowItemModal(false);
      itemForm.reset();
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest<void>(`/menu/items/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-menu-items'] });
    },
  });

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 flex items-center space-x-3">
            <Utensils className="w-8 h-8 text-amber-400" />
            <span>Menu Management</span>
          </h1>
          <p className="text-sm text-slate-400 font-light mt-1">
            Create categories, add dishes, and manage pricing
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="secondary" onClick={() => setShowCategoryModal(true)}>
            <Plus className="w-4 h-4" /> Add Category
          </Button>
          <Button variant="primary" onClick={() => setShowItemModal(true)}>
            <Plus className="w-4 h-4" /> Add Menu Item
          </Button>
        </div>
      </div>

      {/* Categories Overview */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          Categories ({categories?.length || 0})
        </h2>
        <div className="flex flex-wrap gap-2">
          {categories?.map((cat) => (
            <Badge key={cat.id} variant="amber" className="px-3 py-1.5 text-sm">
              {cat.name}
            </Badge>
          ))}
          {(!categories || categories.length === 0) && (
            <p className="text-xs text-slate-500">No categories yet. Create one first.</p>
          )}
        </div>
      </div>

      {/* Menu Items Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : !menuItems || menuItems.length === 0 ? (
        <EmptyState
          title="No Menu Items"
          description="Add your first dish to start taking customer orders."
          action={
            <Button variant="primary" onClick={() => setShowItemModal(true)}>
              <Plus className="w-4 h-4" /> Add First Dish
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {menuItems.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-slate-100">{item.name}</h3>
                    <p className="text-xs text-slate-400 font-light mt-1">
                      {item.description || 'No description'}
                    </p>
                  </div>
                  <span className="text-lg font-extrabold text-amber-400 font-mono">
                    ${Number(item.price).toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center flex-wrap gap-2">
                  {item.category && (
                    <Badge variant="blue">{item.category.name}</Badge>
                  )}
                  {item.is_vegetarian && (
                    <Badge variant="emerald" className="gap-1">
                      <Leaf className="w-3 h-3" /> Veg
                    </Badge>
                  )}
                  {item.is_gluten_free && <Badge variant="purple">GF</Badge>}
                  <Badge variant="slate">{item.preparation_time_mins} mins</Badge>
                </div>

                <div className="pt-2 border-t border-slate-800/80">
                  <Button
                    variant="danger"
                    size="sm"
                    className="w-full"
                    loading={deleteItemMutation.isPending}
                    onClick={() => {
                      if (window.confirm(`Delete "${item.name}"?`)) {
                        deleteItemMutation.mutate(item.id);
                      }
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove Item
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ─── Create Category Modal ─── */}
      <Modal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        title="Add New Category"
      >
        <form
          onSubmit={catForm.handleSubmit((data: CategoryFormValues) => createCategoryMutation.mutate(data))}
          className="space-y-4"
        >
          <Input
            label="Category Name"
            placeholder="Appetizers, Main Courses, Desserts..."
            error={catForm.formState.errors.name?.message}
            {...catForm.register('name')}
          />

          <Input
            label="Description (Optional)"
            placeholder="Brief description of this category"
            {...catForm.register('description')}
          />

          <Input
            label="Display Order"
            type="number"
            min={0}
            error={catForm.formState.errors.display_order?.message}
            {...catForm.register('display_order')}
          />

          <div className="flex items-center space-x-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowCategoryModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              loading={createCategoryMutation.isPending}
            >
              Create Category
            </Button>
          </div>
        </form>
      </Modal>

      {/* ─── Create Menu Item Modal ─── */}
      <Modal
        isOpen={showItemModal}
        onClose={() => setShowItemModal(false)}
        title="Add New Menu Item"
      >
        <form
          onSubmit={itemForm.handleSubmit((data: MenuItemFormValues) => createItemMutation.mutate(data))}
          className="space-y-4"
        >
          <Input
            label="Dish Name"
            placeholder="Truffle Risotto, Caesar Salad..."
            error={itemForm.formState.errors.name?.message}
            {...itemForm.register('name')}
          />

          <Input
            label="Description (Optional)"
            placeholder="Rich and creamy truffle-infused..."
            {...itemForm.register('description')}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price ($)"
              type="number"
              step="0.01"
              min={0.01}
              error={itemForm.formState.errors.price?.message}
              {...itemForm.register('price')}
            />

            <Input
              label="Prep Time (mins)"
              type="number"
              min={1}
              error={itemForm.formState.errors.preparation_time_mins?.message}
              {...itemForm.register('preparation_time_mins')}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Category
            </label>
            <select
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/30 transition"
              {...itemForm.register('category_id')}
            >
              <option value="">Select a category</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {itemForm.formState.errors.category_id && (
              <p className="text-xs text-rose-400">
                {itemForm.formState.errors.category_id.message}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-6">
            <label className="flex items-center space-x-2 text-sm text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-amber-500/30"
                {...itemForm.register('is_vegetarian')}
              />
              <span>Vegetarian</span>
            </label>

            <label className="flex items-center space-x-2 text-sm text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-amber-500/30"
                {...itemForm.register('is_gluten_free')}
              />
              <span>Gluten Free</span>
            </label>
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowItemModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              loading={createItemMutation.isPending}
            >
              Add to Menu
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
