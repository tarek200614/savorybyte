import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/services/api';
import { Category, MenuItem, Order, RestaurantTable } from '@/types';
import { useTranslation } from '@/i18n/LanguageContext';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { CardSkeleton } from '@/components/feedback/Skeleton';
import {
  Utensils,
  ShoppingBag,
  Plus,
  Minus,
  CheckCircle2,
  Leaf,
  ShieldCheck,
  Search,
  Clock,
  X,
  Eye,
} from 'lucide-react';

import { resolveMenuItemImage, CATEGORY_FALLBACKS } from '@/utils/menuImage';

interface CartItem {
  item: MenuItem;
  quantity: number;
  notes?: string;
}

export function DigitalMenu() {
  const { t, getDish, resolveCategory, resolveLocation, formatPrice } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [dietaryFilter, setDietaryFilter] = useState<'ALL' | 'VEG' | 'GF'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [detailItem, setDetailItem] = useState<MenuItem | null>(null);
  const [detailQuantity, setDetailQuantity] = useState<number>(1);

  // Fetch categories from database
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => apiRequest<Category[]>('/menu/categories'),
  });

  // Fetch active tables for dine-in ordering
  const { data: tables } = useQuery<RestaurantTable[]>({
    queryKey: ['tables'],
    queryFn: () => apiRequest<RestaurantTable[]>('/tables'),
  });

  // Fetch menu items from database
  const { data: menuItems, isLoading, isError, refetch } = useQuery<MenuItem[]>({
    queryKey: ['menu-items', selectedCategory, searchQuery],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category_id', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);
      return apiRequest<MenuItem[]>(`/menu/items?${params.toString()}`);
    },
  });

  const filteredMenuItems = menuItems?.filter((item) => {
    if (dietaryFilter === 'VEG' && !item.is_vegetarian) return false;
    if (dietaryFilter === 'GF' && !item.is_gluten_free) return false;
    return true;
  });

  const addToCart = (item: MenuItem, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.item.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.item.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { item, quantity }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) =>
      prev
        .map((i) => (i.item.id === itemId ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const totalCartAmount = cart.reduce(
    (sum, i) => sum + Number(i.item.price) * i.quantity,
    0
  );

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setSubmitting(true);
    setOrderSuccess(null);

    try {
      const order = await apiRequest<Order>('/orders', {
        method: 'POST',
        body: JSON.stringify({
          table_id: selectedTableId ? selectedTableId : null,
          items: cart.map((i) => ({
            menu_item_id: i.item.id,
            quantity: i.quantity,
            item_notes: i.notes || null,
          })),
        }),
      });

      setOrderSuccess(order.order_number);
      setCart([]);
      setSelectedTableId('');
    } catch (err: unknown) {
      alert((err as Error).message || t.common.error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-champagne/15">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 rtl:space-x-reverse px-3 py-1 rounded-full bg-charcoal border border-champagne/20 text-champagne text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-champagne" />
            <span>{t.common.halalCertified} • {t.common.alcoholFreePorkFree}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-ivory flex items-center space-x-3 rtl:space-x-reverse">
            <Utensils className="w-8 h-8 text-champagne" />
            <span>{t.menu.title}</span>
          </h1>
          <p className="text-sm text-stone-300 font-light max-w-2xl leading-relaxed">
            {t.menu.subtitle}
          </p>
        </div>

        {/* Search Bar */}
        <div className="w-full md:w-72">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 rtl:left-auto rtl:right-3 top-3.5" />
            <Input
              placeholder={t.menu.searchPlaceholder}
              className="pl-9 rtl:pl-3 rtl:pr-9 bg-charcoal border-champagne/20 text-ivory placeholder-stone-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 rtl:right-auto rtl:left-3 top-3 text-stone-400 hover:text-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category & Dietary Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-champagne/15 pb-4">
        {/* Editorial Category Navigation */}
        <div className="flex items-center space-x-6 rtl:space-x-reverse overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`text-xs uppercase tracking-widest font-serif font-medium pb-2 transition whitespace-nowrap border-b-2 ${
              selectedCategory === null
                ? 'text-champagne border-saffron'
                : 'text-stone-400 border-transparent hover:text-ivory hover:border-stone-600'
            }`}
          >
            {t.menu.allCategories}
          </button>
          {categories?.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`text-xs uppercase tracking-widest font-serif font-medium pb-2 transition whitespace-nowrap border-b-2 ${
                selectedCategory === cat.id
                  ? 'text-champagne border-saffron'
                  : 'text-stone-400 border-transparent hover:text-ivory hover:border-stone-600'
              }`}
            >
              {resolveCategory(cat.name)}
            </button>
          ))}
        </div>

        {/* Dietary Toggle */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse bg-charcoal p-1 rounded-xl border border-champagne/15 text-xs font-semibold">
          <button
            onClick={() => setDietaryFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg transition ${
              dietaryFilter === 'ALL'
                ? 'bg-midnight text-ivory shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            {t.menu.allDiets}
          </button>
          <button
            onClick={() => setDietaryFilter('VEG')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1 rtl:space-x-reverse ${
              dietaryFilter === 'VEG'
                ? 'bg-botanical/40 text-botanical-light border border-botanical/40'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Leaf className="w-3.5 h-3.5" />
            <span>{t.menu.vegetarian}</span>
          </button>
          <button
            onClick={() => setDietaryFilter('GF')}
            className={`px-3 py-1.5 rounded-lg transition ${
              dietaryFilter === 'GF'
                ? 'bg-midnight text-champagne border border-champagne/30'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            {t.menu.glutenFree}
          </button>
        </div>
      </div>

      {orderSuccess && (
        <div className="p-4 rounded-2xl bg-charcoal border border-champagne/40 text-champagne flex items-center space-x-3 rtl:space-x-reverse animate-fade-in shadow-xl">
          <CheckCircle2 className="w-6 h-6 text-champagne flex-shrink-0" />
          <div>
            <p className="font-bold text-sm text-ivory">{t.menu.orderSuccessTitle}</p>
            <p className="text-xs text-stone-300 font-mono">
              {t.orders.ticketLabel}: <span className="font-bold text-champagne">{orderSuccess}</span>. {t.menu.orderSuccessDesc}
            </p>
          </div>
        </div>
      )}

      {/* Main Content Layout: Menu Grid + Sticky Cart Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Dishes Grid */}
        <div className="lg:col-span-2 space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : isError ? (
            <div className="text-center py-16 p-8 rounded-2xl bg-charcoal/60 border border-terracotta/30 space-y-4">
              <Utensils className="w-10 h-10 text-terracotta mx-auto" />
              <h3 className="font-serif font-bold text-ivory text-lg">{t.common.error}</h3>
              <p className="text-xs text-stone-400 font-light">{t.common.retry}</p>
              <Button variant="secondary" size="sm" onClick={() => refetch()}>
                {t.common.retry}
              </Button>
            </div>
          ) : !filteredMenuItems || filteredMenuItems.length === 0 ? (
            <div className="text-center py-16 p-8 rounded-2xl bg-charcoal/60 border border-champagne/15 space-y-3">
              <Utensils className="w-10 h-10 text-stone-600 mx-auto" />
              <h3 className="font-serif font-bold text-ivory text-lg">{t.menu.noDishesFoundTitle}</h3>
              <p className="text-xs text-stone-400 font-light">{t.menu.noDishesFoundDesc}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filteredMenuItems.map((item) => {
                const dishTrans = getDish(item.name, item.description);
                return (
                  <Card
                    key={item.id}
                    className="flex flex-col justify-between overflow-hidden group hover:border-champagne/40 transition duration-300 bg-charcoal border-champagne/15 shadow-xl"
                  >
                    {/* Dish Photo with fallback */}
                    <div
                      className="relative h-56 bg-midnight overflow-hidden cursor-pointer"
                      onClick={() => {
                        setDetailItem(item);
                        setDetailQuantity(1);
                      }}
                    >
                      <img
                        src={resolveMenuItemImage(item)}
                        alt={`${dishTrans.name} - ${dishTrans.description}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = CATEGORY_FALLBACKS[item.category?.slug || ''] || CATEGORY_FALLBACKS.default;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-transparent" />

                      {/* Quick View Button overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200 bg-midnight/40 backdrop-blur-[2px]">
                        <span className="inline-flex items-center space-x-1.5 rtl:space-x-reverse px-3 py-1.5 rounded-full bg-charcoal/95 text-champagne text-xs font-semibold border border-champagne/30 shadow-lg">
                          <Eye className="w-3.5 h-3.5 text-champagne" />
                          <span>{t.common.viewDetails}</span>
                        </span>
                      </div>

                      {/* Dietary Badges */}
                      <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 flex flex-wrap gap-1.5">
                        {item.is_vegetarian && (
                          <Badge variant="botanical" className="gap-1 shadow-md text-[10px]">
                            <Leaf className="w-3 h-3" /> {t.menu.vegetarian}
                          </Badge>
                        )}
                        {item.is_gluten_free && (
                          <Badge variant="champagne" className="shadow-md text-[10px]">
                            {t.menu.glutenFree}
                          </Badge>
                        )}
                      </div>

                      {/* Price Badge */}
                      <div className="absolute bottom-3 right-3 rtl:right-auto rtl:left-3 font-serif font-bold text-base text-champagne bg-midnight/95 px-3 py-1 rounded-xl border border-champagne/30 backdrop-blur-md shadow-lg" dir="ltr">
                        {formatPrice(item.price)}
                      </div>
                    </div>

                    {/* Card Body */}
                    <CardContent className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                      <div
                        className="space-y-1.5 cursor-pointer"
                        onClick={() => {
                          setDetailItem(item);
                          setDetailQuantity(1);
                        }}
                      >
                        <h3 className="font-serif font-bold text-lg text-ivory group-hover:text-champagne transition">
                          {dishTrans.name}
                        </h3>
                        <p className="text-xs text-stone-300 font-light line-clamp-2 leading-relaxed">
                          {dishTrans.description}
                        </p>
                      </div>

                      <div className="pt-2 flex items-center justify-between text-xs text-stone-400 font-mono">
                        <span className="flex items-center space-x-1 rtl:space-x-reverse">
                          <Clock className="w-3.5 h-3.5 text-champagne" />
                          <span>{item.preparation_time_mins} {t.common.mins}</span>
                        </span>
                        {item.category && (
                          <span className="text-champagne-light text-[11px] font-sans font-medium">
                            {resolveCategory(item.category.name)}
                          </span>
                        )}
                      </div>
                    </CardContent>

                    {/* Add to Order Action */}
                    <div className="p-4 bg-midnight/60 border-t border-champagne/15 flex items-center justify-between">
                      <span className="text-xs text-stone-400 font-mono">
                        {item.is_available ? t.common.available : t.common.soldOut}
                      </span>
                      <Button
                        size="sm"
                        variant="primary"
                        disabled={!item.is_available}
                        onClick={() => addToCart(item)}
                        className="font-medium text-xs shadow-md shadow-saffron/20"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1 rtl:mr-0 rtl:ml-1" /> {t.menu.addToTray}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Sticky Cart & Checkout Panel */}
        <div className="space-y-4">
          <Card className="sticky top-24 border-champagne/20 bg-charcoal/95 backdrop-blur-md shadow-2xl">
            <div className="p-5 border-b border-champagne/15 flex items-center justify-between">
              <h2 className="font-serif font-bold text-base text-ivory flex items-center space-x-2 rtl:space-x-reverse">
                <ShoppingBag className="w-5 h-5 text-champagne" />
                <span>{t.menu.orderTray}</span>
              </h2>
              <Badge variant="champagne">{cart.reduce((sum, i) => sum + i.quantity, 0)} {t.menu.itemsCount}</Badge>
            </div>

            <CardContent className="p-5 space-y-4 max-h-[50vh] overflow-y-auto">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-stone-500 space-y-2">
                  <Utensils className="w-8 h-8 mx-auto text-stone-600" />
                  <p className="text-sm text-stone-300 font-medium font-serif">{t.menu.emptyTrayTitle}</p>
                  <p className="text-xs font-light text-stone-400">{t.menu.emptyTrayDesc}</p>
                </div>
              ) : (
                cart.map(({ item, quantity }) => {
                  const itemTrans = getDish(item.name, item.description);
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-midnight border border-champagne/15"
                    >
                      <div className="space-y-0.5">
                        <h4 className="font-medium text-xs text-ivory">{itemTrans.name}</h4>
                        <p className="text-xs text-champagne font-mono font-bold" dir="ltr">
                          {formatPrice(Number(item.price) * quantity)}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 rounded-lg bg-charcoal hover:bg-white/10 text-stone-300 transition"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold font-mono px-1 text-stone-200">{quantity}</span>
                        <button
                          onClick={() => addToCart(item)}
                          className="p-1 rounded-lg bg-charcoal hover:bg-white/10 text-stone-300 transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>

            {cart.length > 0 && (
              <div className="p-5 bg-midnight border-t border-champagne/15 space-y-4">
                {/* Optional Table Number Selector */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-stone-300 uppercase tracking-wider">
                    {t.menu.diningMode}
                  </label>
                  <select
                    value={selectedTableId}
                    onChange={(e) => setSelectedTableId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-charcoal border border-champagne/20 text-stone-200 text-xs focus:outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/30 transition"
                  >
                    <option value="">{t.menu.takeout}</option>
                    {tables?.map((tbl) => (
                      <option key={tbl.id} value={tbl.id}>
                        {t.common.table} {tbl.table_number} ({resolveLocation(tbl.location).name})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between text-stone-300 font-mono text-sm pt-2 border-t border-champagne/15">
                  <span>{t.menu.total}:</span>
                  <span className="text-xl font-bold text-champagne" dir="ltr">
                    {formatPrice(totalCartAmount)}
                  </span>
                </div>

                <Button
                  variant="primary"
                  className="w-full font-semibold py-3 text-sm shadow-xl shadow-saffron/20"
                  loading={submitting}
                  onClick={handlePlaceOrder}
                >
                  {t.menu.sendOrderToKitchen}
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Dish Details Modal */}
      {detailItem && (
        <Modal
          isOpen={!!detailItem}
          onClose={() => setDetailItem(null)}
          title={getDish(detailItem.name, detailItem.description).name}
        >
          {(() => {
            const dishTrans = getDish(detailItem.name, detailItem.description);
            return (
              <div className="space-y-5">
                {/* Dish Photo */}
                <div className="relative h-64 rounded-xl overflow-hidden bg-midnight">
                  <img
                    src={resolveMenuItemImage(detailItem)}
                    alt={`${dishTrans.name} - ${dishTrans.description}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = CATEGORY_FALLBACKS[detailItem.category?.slug || ''] || CATEGORY_FALLBACKS.default;
                    }}
                  />
                  <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 flex gap-2">
                    {detailItem.is_vegetarian && (
                      <Badge variant="botanical" className="gap-1 shadow-md">
                        <Leaf className="w-3.5 h-3.5" /> {t.menu.vegetarian}
                      </Badge>
                    )}
                    {detailItem.is_gluten_free && (
                      <Badge variant="champagne" className="shadow-md">
                        {t.menu.glutenFree}
                      </Badge>
                    )}
                  </div>
                  <div className="absolute bottom-3 right-3 rtl:right-auto rtl:left-3 font-serif font-bold text-lg text-champagne bg-midnight/95 px-3 py-1.5 rounded-xl border border-champagne/30" dir="ltr">
                    {formatPrice(detailItem.price)}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <h4 className="text-xs uppercase tracking-widest font-mono text-champagne">{t.menu.culinaryDescription}</h4>
                  <p className="text-sm text-stone-300 font-light leading-relaxed">
                    {dishTrans.description}
                  </p>
                </div>

                {/* Preparation Details */}
                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-midnight border border-champagne/15 text-xs">
                  <div>
                    <span className="text-stone-500 block font-mono">{t.admin.categorySelectLabel}</span>
                    <span className="font-semibold text-stone-200">
                      {detailItem.category ? resolveCategory(detailItem.category.name) : t.menu.allCategories}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-500 block font-mono">{t.menu.prepTime}</span>
                    <span className="font-semibold text-stone-200 flex items-center space-x-1 rtl:space-x-reverse">
                      <Clock className="w-3.5 h-3.5 text-champagne" />
                      <span>~{detailItem.preparation_time_mins} {t.common.mins}</span>
                    </span>
                  </div>
                </div>

                {/* Quantity and Add to Tray */}
                <div className="pt-2 flex items-center justify-between border-t border-champagne/15">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse bg-midnight border border-champagne/15 rounded-xl p-1.5">
                    <button
                      onClick={() => setDetailQuantity((q) => Math.max(1, q - 1))}
                      className="p-1.5 rounded-lg bg-charcoal hover:bg-white/10 text-stone-300 transition"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-mono font-bold text-sm px-2 text-ivory">{detailQuantity}</span>
                    <button
                      onClick={() => setDetailQuantity((q) => q + 1)}
                      className="p-1.5 rounded-lg bg-charcoal hover:bg-white/10 text-stone-300 transition"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <Button
                    variant="primary"
                    className="font-semibold px-6 shadow-md shadow-saffron/20"
                    onClick={() => {
                      addToCart(detailItem, detailQuantity);
                      setDetailItem(null);
                    }}
                  >
                    <ShoppingBag className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
                    {t.menu.addToTray} ({formatPrice(Number(detailItem.price) * detailQuantity)})
                  </Button>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}
    </div>
  );
}
