import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/services/api';
import { Category, MenuItem, MenuItemChangeLog } from '@/types';
import { useTranslation } from '@/i18n/LanguageContext';
import { resolveMenuItemImage, CATEGORY_FALLBACKS } from '@/utils/menuImage';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/feedback/EmptyState';
import { CardSkeleton } from '@/components/feedback/Skeleton';
import {
  Utensils,
  Plus,
  Trash2,
  Edit3,
  Leaf,
  Clock,
  Search,
  CheckCircle2,
  XCircle,
  History,
  Tag,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

/* ─── Schemas ─── */
const categorySchema = z.object({
  name: z.string().min(2, 'Category name is required'),
  description: z.string().optional(),
  display_order: z.coerce.number().min(0),
});

const menuItemSchema = z.object({
  name: z.string().trim().min(1, 'Item name cannot be empty').max(150, 'Name must be 150 characters or less'),
  description: z.string().max(2000, 'Description must be 2000 characters or less').optional(),
  price: z.coerce.number().positive('Price must be greater than 0'),
  image_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  category_id: z.string().uuid('Select a category'),
  preparation_time_mins: z.coerce.number().min(1, 'Prep time must be at least 1 min'),
  is_available: z.boolean(),
  is_vegetarian: z.boolean(),
  is_gluten_free: z.boolean(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;
type MenuItemFormValues = z.infer<typeof menuItemSchema>;

export function ManageMenu() {
  const { t, getDish, resolveCategory, formatPrice } = useTranslation();
  const queryClient = useQueryClient();

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalTab, setActiveModalTab] = useState<'details' | 'history'>('details');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  /* ─── Queries ─── */
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['admin-categories'],
    queryFn: () => apiRequest<Category[]>('/menu/categories'),
  });

  const { data: menuItems, isLoading } = useQuery<MenuItem[]>({
    queryKey: ['admin-menu-items'],
    queryFn: () => apiRequest<MenuItem[]>('/menu/items'),
  });

  const { data: itemHistory, isLoading: isLoadingHistory } = useQuery<MenuItemChangeLog[]>({
    queryKey: ['menu-item-history', editingItem?.id],
    queryFn: () => apiRequest<MenuItemChangeLog[]>(`/menu/items/${editingItem?.id}/history`),
    enabled: !!editingItem && activeModalTab === 'history',
  });

  /* ─── Forms ─── */
  const catForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { display_order: 0 },
  });

  const createItemForm = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 15,
      image_url: '',
      preparation_time_mins: 15,
      is_available: true,
      is_vegetarian: false,
      is_gluten_free: false,
    },
  });

  const editItemForm = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema),
  });

  /* ─── Status feedback helper ─── */
  const showTemporaryStatus = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => {
      setStatusMessage(null);
    }, 4500);
  };

  /* ─── Mutations ─── */
  const createCategoryMutation = useMutation({
    mutationFn: (data: CategoryFormValues) =>
      apiRequest<Category>('/menu/categories', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setShowCategoryModal(false);
      catForm.reset();
      showTemporaryStatus('success', t.admin.createCategoryBtn);
    },
    onError: (err: Error) => {
      showTemporaryStatus('error', err?.message || 'Failed to create category');
    },
  });

  const createItemMutation = useMutation({
    mutationFn: (data: MenuItemFormValues) =>
      apiRequest<MenuItem>('/menu/items', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          image_url: data.image_url || null,
          description: data.description || null,
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-menu-items'] });
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      setShowItemModal(false);
      createItemForm.reset();
      showTemporaryStatus('success', t.admin.productCreatedSuccess);
    },
    onError: (err: Error) => {
      showTemporaryStatus('error', err?.message || 'Failed to create product');
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: (data: MenuItemFormValues) => {
      if (!editingItem) throw new Error('No product selected for editing');
      return apiRequest<MenuItem>(`/menu/items/${editingItem.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: data.name,
          description: data.description || null,
          price: data.price,
          category_id: data.category_id,
          image_url: data.image_url || null,
          preparation_time_mins: data.preparation_time_mins,
          is_available: data.is_available,
          is_vegetarian: data.is_vegetarian,
          is_gluten_free: data.is_gluten_free,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-menu-items'] });
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      queryClient.invalidateQueries({ queryKey: ['menu-item-history', editingItem?.id] });
      setEditingItem(null);
      showTemporaryStatus('success', t.admin.productUpdatedSuccess);
    },
    onError: (err: Error) => {
      showTemporaryStatus('error', err?.message || 'Failed to update product');
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest<void>(`/menu/items/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-menu-items'] });
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      showTemporaryStatus('success', t.admin.productDeletedSuccess);
    },
    onError: (err: Error) => {
      showTemporaryStatus('error', err?.message || 'Failed to remove dish');
    },
  });

  const handleOpenEdit = (item: MenuItem) => {
    setEditingItem(item);
    setActiveModalTab('details');
    editItemForm.reset({
      name: item.name,
      description: item.description || '',
      price: item.price,
      image_url: item.image_url || '',
      category_id: item.category_id || '',
      preparation_time_mins: item.preparation_time_mins || 15,
      is_available: item.is_available ?? true,
      is_vegetarian: item.is_vegetarian ?? false,
      is_gluten_free: item.is_gluten_free ?? false,
    });
  };

  /* ─── Filtering Logic ─── */
  const filteredItems = (menuItems || []).filter((item) => {
    const matchesCategory =
      selectedCategoryFilter === 'ALL' || item.category_id === selectedCategoryFilter;
    const dishTrans = getDish(item.name, item.description);
    const searchLower = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !searchLower ||
      item.name.toLowerCase().includes(searchLower) ||
      dishTrans.name.toLowerCase().includes(searchLower) ||
      (item.description && item.description.toLowerCase().includes(searchLower)) ||
      dishTrans.description.toLowerCase().includes(searchLower);

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* ─── Header ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-champagne/15 pb-6">
        <div>
          <div className="flex items-center space-x-2.5 rtl:space-x-reverse mb-1">
            <Badge variant="champagne" className="gap-1 px-2.5 py-0.5 text-[10px] tracking-wider uppercase">
              <Sparkles className="w-3 h-3" />
              SavoryByte Culinary Admin
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-ivory flex items-center space-x-3 rtl:space-x-reverse">
            <Utensils className="w-8 h-8 text-champagne" />
            <span>{t.admin.manageMenu}</span>
          </h1>
          <p className="text-sm text-stone-400 mt-1.5 max-w-2xl font-light">
            {t.admin.subtitle}
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <Button
            variant="secondary"
            onClick={() => setShowCategoryModal(true)}
            className="border-champagne/30 hover:border-champagne text-champagne text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4 mr-1.5 rtl:mr-0 rtl:ml-1.5" />
            {t.admin.addCategory}
          </Button>
          <Button
            variant="primary"
            onClick={() => setShowItemModal(true)}
            className="shadow-lg shadow-saffron/20 bg-saffron hover:bg-saffron-dark text-white text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4 mr-1.5 rtl:mr-0 rtl:ml-1.5" />
            {t.admin.addDish}
          </Button>
        </div>
      </div>

      {/* ─── Status Feedback Toast ─── */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl flex items-center space-x-3 rtl:space-x-reverse text-sm font-medium transition-all duration-300 ${
            statusMessage.type === 'success'
              ? 'bg-botanical/20 border border-botanical/40 text-botanical-light'
              : 'bg-terracotta/20 border border-terracotta/40 text-terracotta-light'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-botanical" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-terracotta" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* ─── Search & Category Filter Toolbar ─── */}
      <div className="bg-charcoal p-4 rounded-2xl border border-champagne/15 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.admin.searchDishesPlaceholder}
              className="w-full pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-2.5 rounded-xl bg-midnight border border-champagne/20 text-ivory text-sm placeholder-stone-500 focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron/30 transition"
            />
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-3 text-xs font-mono text-stone-400 self-end lg:self-center">
            <span className="bg-midnight px-3 py-1.5 rounded-lg border border-champagne/15">
              <strong className="text-champagne font-bold">{filteredItems.length}</strong> / {menuItems?.length || 0} {t.nav.menu}
            </span>
            <span className="bg-midnight px-3 py-1.5 rounded-lg border border-champagne/15">
              <strong className="text-champagne font-bold">{categories?.length || 0}</strong> {t.admin.activeCategories}
            </span>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <button
            type="button"
            onClick={() => setSelectedCategoryFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
              selectedCategoryFilter === 'ALL'
                ? 'bg-saffron text-white shadow-sm font-semibold'
                : 'bg-midnight text-stone-300 hover:text-ivory border border-champagne/15 hover:border-champagne/30'
            }`}
          >
            {t.admin.allCategoriesFilter}
          </button>
          {categories?.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategoryFilter(cat.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                selectedCategoryFilter === cat.id
                  ? 'bg-champagne text-midnight font-bold shadow-sm'
                  : 'bg-midnight text-stone-300 hover:text-ivory border border-champagne/15 hover:border-champagne/30'
              }`}
            >
              {resolveCategory(cat.name)}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Menu Items Grid ─── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filteredItems.length === 0 ? (
        <EmptyState
          title={t.menu.noDishesFoundTitle}
          description={t.menu.noDishesFoundDesc}
          action={
            <Button
              variant="primary"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategoryFilter('ALL');
              }}
            >
              Reset Filters
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const dishTrans = getDish(item.name, item.description);
            const categoryName = item.category?.name
              ? resolveCategory(item.category.name)
              : categories?.find((c) => c.id === item.category_id)?.name
              ? resolveCategory(categories.find((c) => c.id === item.category_id)!.name)
              : 'Gourmet Selection';

            return (
              <Card
                key={item.id}
                className="overflow-hidden flex flex-col justify-between border-champagne/15 bg-charcoal hover:border-champagne/30 shadow-xl transition-all duration-300 group"
              >
                {/* Visual Header */}
                <div className="relative h-48 overflow-hidden bg-midnight">
                  <img
                    src={resolveMenuItemImage(item)}
                    alt={`${dishTrans.name} - ${dishTrans.description}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        CATEGORY_FALLBACKS[item.category?.slug || ''] || CATEGORY_FALLBACKS.default;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/30 to-transparent" />

                  {/* Availability Badge */}
                  <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3">
                    {item.is_available ? (
                      <Badge variant="botanical" className="gap-1 text-[11px] px-2.5 py-1 font-semibold shadow-md bg-emerald-950/80 backdrop-blur-sm border-emerald-500/40 text-emerald-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        {t.common.available}
                      </Badge>
                    ) : (
                      <Badge variant="terracotta" className="gap-1 text-[11px] px-2.5 py-1 font-semibold shadow-md bg-rose-950/80 backdrop-blur-sm border-rose-500/40 text-rose-300">
                        <XCircle className="w-3 h-3 text-rose-400" />
                        {t.common.soldOut}
                      </Badge>
                    )}
                  </div>

                  {/* Category Pill */}
                  <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3">
                    <span className="bg-midnight/80 backdrop-blur-sm text-champagne text-[10px] font-mono font-semibold px-2.5 py-1 rounded-md border border-champagne/30 flex items-center gap-1">
                      <Tag className="w-2.5 h-2.5" />
                      {categoryName}
                    </span>
                  </div>
                </div>

                {/* Content Details */}
                <CardContent className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-serif font-bold text-lg text-ivory group-hover:text-champagne transition-colors">
                          {dishTrans.name}
                        </h3>
                        {item.name !== dishTrans.name && (
                          <p className="text-[11px] text-stone-400 font-mono italic">
                            ({item.name})
                          </p>
                        )}
                      </div>
                      <div className="text-right rtl:text-left flex-shrink-0">
                        <span className="text-lg font-bold text-champagne font-mono" dir="ltr">
                          {formatPrice(item.price)}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-stone-300/90 font-light line-clamp-3 leading-relaxed">
                      {dishTrans.description}
                    </p>
                  </div>

                  {/* Dietary & Prep Meta */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-champagne/10">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {item.is_vegetarian && (
                          <Badge variant="botanical" className="gap-1 text-[10px] px-2 py-0.5">
                            <Leaf className="w-3 h-3" /> {t.menu.vegetarian}
                          </Badge>
                        )}
                        {item.is_gluten_free && (
                          <Badge variant="champagne" className="text-[10px] px-2 py-0.5">
                            {t.menu.glutenFree}
                          </Badge>
                        )}
                      </div>

                      <span className="text-stone-400 font-mono text-[11px] flex items-center space-x-1 rtl:space-x-reverse">
                        <Clock className="w-3.5 h-3.5 text-champagne" />
                        <span>{item.preparation_time_mins} {t.common.mins}</span>
                      </span>
                    </div>

                    {/* Action Buttons: Edit & Delete */}
                    <div className="pt-3 border-t border-champagne/15 flex items-center justify-between gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleOpenEdit(item)}
                        className="flex-1 text-xs border-champagne/30 hover:border-champagne text-ivory hover:text-champagne font-medium transition"
                      >
                        <Edit3 className="w-3.5 h-3.5 mr-1.5 rtl:mr-0 rtl:ml-1.5 text-champagne" />
                        {t.admin.editDish}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-terracotta hover:text-terracotta-light hover:bg-terracotta/10 px-3 font-medium transition"
                        loading={deleteItemMutation.isPending}
                        onClick={() => {
                          if (window.confirm(`${t.admin.deleteDishConfirm} (${dishTrans.name})`)) {
                            deleteItemMutation.mutate(item.id);
                          }
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="sr-only">{t.admin.removeDish}</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ─── EDIT MENU ITEM MODAL ─── */}
      <Modal
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        title={t.admin.editDishModalTitle}
      >
        <div className="space-y-5">
          {/* Modal Subtabs (Details vs Audit History) */}
          <div className="flex border-b border-champagne/20">
            <button
              type="button"
              onClick={() => setActiveModalTab('details')}
              className={`pb-2.5 px-4 text-xs font-semibold uppercase tracking-wider transition ${
                activeModalTab === 'details'
                  ? 'border-b-2 border-saffron text-saffron'
                  : 'text-stone-400 hover:text-ivory'
              }`}
            >
              {t.common.edit} Details
            </button>
            <button
              type="button"
              onClick={() => setActiveModalTab('history')}
              className={`pb-2.5 px-4 text-xs font-semibold uppercase tracking-wider transition flex items-center gap-1.5 ${
                activeModalTab === 'history'
                  ? 'border-b-2 border-champagne text-champagne'
                  : 'text-stone-400 hover:text-ivory'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              {t.admin.changeHistory}
            </button>
          </div>

          {activeModalTab === 'details' ? (
            <form
              onSubmit={editItemForm.handleSubmit((data) => updateItemMutation.mutate(data))}
              className="space-y-4"
            >
              {/* Product Name */}
              <Input
                label={t.admin.dishNameLabel}
                placeholder="e.g. Halal A5 Japanese Wagyu Ribeye..."
                error={editItemForm.formState.errors.name?.message}
                {...editItemForm.register('name')}
              />

              {/* Product Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider">
                  {t.admin.dishDescLabel}
                </label>
                <textarea
                  rows={3}
                  placeholder="Detailed culinary ingredients, preparation notes..."
                  className="w-full px-4 py-2.5 rounded-xl bg-midnight border border-champagne/20 text-ivory text-sm focus:outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/30 transition resize-y"
                  {...editItemForm.register('description')}
                />
                {editItemForm.formState.errors.description && (
                  <p className="text-xs text-terracotta">
                    {editItemForm.formState.errors.description.message}
                  </p>
                )}
              </div>

              {/* Price (€ EUR) and Preparation Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={t.admin.priceLabel}
                  type="number"
                  step="0.01"
                  min={0.01}
                  error={editItemForm.formState.errors.price?.message}
                  {...editItemForm.register('price')}
                />

                <Input
                  label={t.admin.prepTimeLabel}
                  type="number"
                  min={1}
                  error={editItemForm.formState.errors.preparation_time_mins?.message}
                  {...editItemForm.register('preparation_time_mins')}
                />
              </div>

              {/* Category Dropdown */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider">
                  {t.admin.categorySelectLabel}
                </label>
                <select
                  className="w-full px-4 py-2.5 rounded-xl bg-midnight border border-champagne/20 text-ivory text-sm focus:outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/30 transition"
                  {...editItemForm.register('category_id')}
                >
                  <option value="">{t.admin.selectCategoryPlaceholder}</option>
                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {resolveCategory(cat.name)}
                    </option>
                  ))}
                </select>
                {editItemForm.formState.errors.category_id && (
                  <p className="text-xs text-terracotta">
                    {editItemForm.formState.errors.category_id.message}
                  </p>
                )}
              </div>

              {/* Image URL & Live Preview */}
              <div className="space-y-2">
                <Input
                  label={t.admin.dishImageLabel}
                  placeholder="https://images.unsplash.com/photo-..."
                  error={editItemForm.formState.errors.image_url?.message}
                  {...editItemForm.register('image_url')}
                />

                {editItemForm.watch('image_url') && (
                  <div className="p-3 rounded-xl bg-midnight border border-champagne/15 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-stone-400">{t.admin.liveImagePreview}:</span>
                      <span className="text-champagne bg-charcoal px-2 py-0.5 rounded border border-champagne/30">
                        {t.admin.aspectRatioNotice}
                      </span>
                    </div>
                    <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-midnight border border-champagne/15">
                      <img
                        src={editItemForm.watch('image_url') || ''}
                        alt="Dish Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = CATEGORY_FALLBACKS.default;
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Availability & Dietary Checkboxes */}
              <div className="p-3.5 rounded-xl bg-midnight/60 border border-champagne/15 space-y-3">
                <label className="flex items-center space-x-2.5 rtl:space-x-reverse text-sm font-medium text-ivory cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded bg-midnight border-champagne/30 text-saffron focus:ring-saffron/30 w-4 h-4"
                    {...editItemForm.register('is_available')}
                  />
                  <span>{t.admin.isAvailable}</span>
                </label>

                <div className="flex items-center space-x-6 rtl:space-x-reverse pt-1 border-t border-champagne/10">
                  <label className="flex items-center space-x-2 rtl:space-x-reverse text-xs text-stone-300 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded bg-midnight border-champagne/30 text-saffron focus:ring-saffron/30"
                      {...editItemForm.register('is_vegetarian')}
                    />
                    <span>{t.menu.vegetarian}</span>
                  </label>

                  <label className="flex items-center space-x-2 rtl:space-x-reverse text-xs text-stone-300 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded bg-midnight border-champagne/30 text-saffron focus:ring-saffron/30"
                      {...editItemForm.register('is_gluten_free')}
                    />
                    <span>{t.menu.glutenFree}</span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-3 rtl:space-x-reverse pt-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setEditingItem(null)}
                  className="flex-1"
                >
                  {t.common.cancel}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1 shadow-md shadow-saffron/20 bg-saffron hover:bg-saffron-dark text-white"
                  loading={updateItemMutation.isPending}
                >
                  {t.admin.saveDishChanges}
                </Button>
              </div>
            </form>
          ) : (
            /* Audit Change Log Tab */
            <div className="space-y-3">
              {isLoadingHistory ? (
                <div className="py-8 text-center text-stone-400 font-mono text-xs">
                  {t.common.loading}...
                </div>
              ) : !itemHistory || itemHistory.length === 0 ? (
                <div className="py-8 text-center text-stone-400 text-xs">
                  <History className="w-6 h-6 mx-auto mb-2 text-stone-500" />
                  <p>{t.admin.noHistory}</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {itemHistory.map((log) => (
                    <div
                      key={log.id}
                      className="p-3.5 rounded-xl bg-midnight border border-champagne/15 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between text-stone-400 font-mono text-[11px]">
                        <span>{new Date(log.timestamp).toLocaleString()}</span>
                        <span className="text-champagne font-semibold">{log.actor_email || log.actor_name || 'Admin'}</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-charcoal border border-champagne/10 font-mono text-[11px] text-stone-300 leading-relaxed break-words">
                        {log.details}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* ─── CREATE MENU ITEM MODAL ─── */}
      <Modal
        isOpen={showItemModal}
        onClose={() => setShowItemModal(false)}
        title={t.admin.dishModalTitle}
      >
        <form
          onSubmit={createItemForm.handleSubmit((data) => createItemMutation.mutate(data))}
          className="space-y-4"
        >
          <Input
            label={t.admin.dishNameLabel}
            placeholder="e.g. Halal A5 Japanese Wagyu Ribeye..."
            error={createItemForm.formState.errors.name?.message}
            {...createItemForm.register('name')}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider">
              {t.admin.dishDescLabel}
            </label>
            <textarea
              rows={3}
              placeholder="Detailed ingredients and culinary preparation notes..."
              className="w-full px-4 py-2.5 rounded-xl bg-midnight border border-champagne/20 text-ivory text-sm focus:outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/30 transition resize-y"
              {...createItemForm.register('description')}
            />
          </div>

          <div className="space-y-2">
            <Input
              label={t.admin.dishImageLabel}
              placeholder="https://images.unsplash.com/photo-..."
              error={createItemForm.formState.errors.image_url?.message}
              {...createItemForm.register('image_url')}
            />

            {createItemForm.watch('image_url') && (
              <div className="p-3 rounded-xl bg-midnight border border-champagne/15 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-stone-400">{t.admin.liveImagePreview}:</span>
                  <span className="text-champagne bg-charcoal px-2 py-0.5 rounded border border-champagne/30">
                    {t.admin.aspectRatioNotice}
                  </span>
                </div>
                <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-midnight border border-champagne/15">
                  <img
                    src={createItemForm.watch('image_url')}
                    alt="Dish Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = CATEGORY_FALLBACKS.default;
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t.admin.priceLabel}
              type="number"
              step="0.01"
              min={0.01}
              error={createItemForm.formState.errors.price?.message}
              {...createItemForm.register('price')}
            />

            <Input
              label={t.admin.prepTimeLabel}
              type="number"
              min={1}
              error={createItemForm.formState.errors.preparation_time_mins?.message}
              {...createItemForm.register('preparation_time_mins')}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider">
              {t.admin.categorySelectLabel}
            </label>
            <select
              className="w-full px-4 py-2.5 rounded-xl bg-midnight border border-champagne/20 text-ivory text-sm focus:outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/30 transition"
              {...createItemForm.register('category_id')}
            >
              <option value="">{t.admin.selectCategoryPlaceholder}</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {resolveCategory(cat.name)}
                </option>
              ))}
            </select>
            {createItemForm.formState.errors.category_id && (
              <p className="text-xs text-terracotta">
                {createItemForm.formState.errors.category_id.message}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-6 rtl:space-x-reverse">
            <label className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-stone-300 cursor-pointer">
              <input
                type="checkbox"
                className="rounded bg-midnight border-champagne/30 text-saffron focus:ring-saffron/30"
                {...createItemForm.register('is_vegetarian')}
              />
              <span>{t.menu.vegetarian}</span>
            </label>

            <label className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-stone-300 cursor-pointer">
              <input
                type="checkbox"
                className="rounded bg-midnight border-champagne/30 text-saffron focus:ring-saffron/30"
                {...createItemForm.register('is_gluten_free')}
              />
              <span>{t.menu.glutenFree}</span>
            </label>
          </div>

          <div className="flex items-center space-x-3 rtl:space-x-reverse pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowItemModal(false)}
              className="flex-1"
            >
              {t.common.cancel}
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1 shadow-md shadow-saffron/20 bg-saffron hover:bg-saffron-dark text-white"
              loading={createItemMutation.isPending}
            >
              {t.admin.publishBtn}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ─── CREATE CATEGORY MODAL ─── */}
      <Modal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        title={t.admin.categoryModalTitle}
      >
        <form
          onSubmit={catForm.handleSubmit((data) => createCategoryMutation.mutate(data))}
          className="space-y-4"
        >
          <Input
            label={t.admin.categoryNameLabel}
            placeholder="Artisanal Mezze, Prime Halal Cuts, Botanical Mocktails..."
            error={catForm.formState.errors.name?.message}
            {...catForm.register('name')}
          />

          <Input
            label={t.admin.categoryDescLabel}
            placeholder="Brief description of this category"
            {...catForm.register('description')}
          />

          <Input
            label={t.admin.categoryOrderLabel}
            type="number"
            min={0}
            error={catForm.formState.errors.display_order?.message}
            {...catForm.register('display_order')}
          />

          <div className="flex items-center space-x-3 rtl:space-x-reverse pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowCategoryModal(false)}
              className="flex-1"
            >
              {t.common.cancel}
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1 shadow-md shadow-saffron/20 bg-saffron hover:bg-saffron-dark text-white"
              loading={createCategoryMutation.isPending}
            >
              {t.admin.createCategoryBtn}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
