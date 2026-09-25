import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/services/api';
import { Category, MenuItem, Order, RestaurantTable } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
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
} from 'lucide-react';

interface CartItem {
  item: MenuItem;
  quantity: number;
  notes?: string;
}

export function DigitalMenu() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [dietaryFilter, setDietaryFilter] = useState<'ALL' | 'VEG' | 'GF'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch categories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => apiRequest<Category[]>('/menu/categories'),
  });

  // Fetch active tables for dine-in ordering
  const { data: tables } = useQuery<RestaurantTable[]>({
    queryKey: ['tables'],
    queryFn: () => apiRequest<RestaurantTable[]>('/tables'),
  });

  // Fetch menu items
  const { data: menuItems, isLoading } = useQuery<MenuItem[]>({
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

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.item.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { item, quantity: 1 }];
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
    (sum, i) => sum + i.item.price * i.quantity,
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
      alert((err as Error).message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>100% Halal Certified Gastronomy • Zero Alcohol • Zero Pork</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 flex items-center space-x-3">
            <Utensils className="w-8 h-8 text-amber-400" />
            <span>Digital Gourmet Menu</span>
          </h1>
          <p className="text-sm text-slate-400 font-light">
            Indulge in Michelin-inspired dishes prepared with certified Halal prime meats, fresh ocean catch, and organic botanicals.
          </p>
        </div>

        {/* Search Bar */}
        <div className="w-full md:w-72">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <Input
              placeholder="Search dishes, ingredients..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category & Dietary Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              selectedCategory === null
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100'
            }`}
          >
            All Categories
          </button>
          {categories?.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Dietary Toggle */}
        <div className="flex items-center space-x-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setDietaryFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg transition ${
              dietaryFilter === 'ALL' ? 'bg-slate-800 text-slate-100' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Diets
          </button>
          <button
            onClick={() => setDietaryFilter('VEG')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1 ${
              dietaryFilter === 'VEG' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Leaf className="w-3 h-3" />
            <span>Vegetarian</span>
          </button>
          <button
            onClick={() => setDietaryFilter('GF')}
            className={`px-3 py-1.5 rounded-lg transition ${
              dietaryFilter === 'GF' ? 'bg-purple-500/20 text-purple-300' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Gluten-Free
          </button>
        </div>
      </div>

      {orderSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center space-x-3 animate-fade-in">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
          <div>
            <p className="font-bold text-sm">Order Dispatched to Kitchen!</p>
            <p className="text-xs text-emerald-400/90 font-mono">
              Reference Ticket: <span className="font-bold">{orderSuccess}</span>. You can track this in My Orders.
            </p>
          </div>
        </div>
      )}

      {/* Main Content Layout: Menu Grid + Sticky Cart Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Dishes Grid */}
        <div className="lg:col-span-2 space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : !filteredMenuItems || filteredMenuItems.length === 0 ? (
            <div className="text-center py-16 p-8 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
              <Utensils className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="font-bold text-slate-200">No Dishes Found</h3>
              <p className="text-xs text-slate-400">Try selecting another category or clearing your search filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filteredMenuItems.map((item) => (
                <Card
                  key={item.id}
                  className="flex flex-col justify-between overflow-hidden group hover:border-amber-500/30 transition duration-300"
                >
                  {/* Dish Photo */}
                  <div className="relative h-48 bg-slate-950 overflow-hidden">
                    <img
                      src={
                        item.image_url ||
                        'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80'
                      }
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      loading="lazy"
                      onError={(e) => {
                        // Fallback image handler
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                    {/* Category / Dietary Badge on Image */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      {item.is_vegetarian && (
                        <Badge variant="emerald" className="gap-1 shadow-md bg-emerald-950/80 border-emerald-500/40 backdrop-blur-md">
                          <Leaf className="w-3 h-3" /> Veg
                        </Badge>
                      )}
                      {item.is_gluten_free && (
                        <Badge variant="purple" className="shadow-md bg-purple-950/80 border-purple-500/40 backdrop-blur-md">
                          GF
                        </Badge>
                      )}
                    </div>

                    <div className="absolute bottom-3 right-3 font-mono font-extrabold text-lg text-amber-400 bg-slate-950/90 px-3 py-1 rounded-xl border border-amber-500/20 backdrop-blur-md shadow-lg">
                      ${Number(item.price).toFixed(2)}
                    </div>
                  </div>

                  {/* Card Body */}
                  <CardContent className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <h3 className="font-bold text-base text-slate-100 group-hover:text-amber-400 transition">
                        {item.name}
                      </h3>
                      <p className="text-xs text-slate-400 font-light line-clamp-2 leading-relaxed">
                        {item.description || 'Artisanal dish crafted with certified Halal ingredients.'}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-xs text-slate-400 font-mono">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>{item.preparation_time_mins} mins</span>
                      </span>
                      <span className="flex items-center space-x-1 text-emerald-400">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>100% Halal</span>
                      </span>
                    </div>
                  </CardContent>

                  {/* Add to Order Action */}
                  <div className="p-4 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-mono">
                      {item.is_available ? 'In Stock' : 'Sold Out'}
                    </span>
                    <Button
                      size="sm"
                      variant="primary"
                      disabled={!item.is_available}
                      onClick={() => addToCart(item)}
                      className="font-bold text-xs"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add to Order
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Sticky Cart & Checkout Panel */}
        <div className="space-y-4">
          <Card className="sticky top-24 border-slate-800 bg-slate-900/90 backdrop-blur-md shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h2 className="font-bold text-base text-slate-100 flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                <span>Your Order Tray</span>
              </h2>
              <Badge variant="amber">{cart.reduce((sum, i) => sum + i.quantity, 0)} Items</Badge>
            </div>

            <CardContent className="p-5 space-y-4 max-h-[50vh] overflow-y-auto">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-slate-500 space-y-2">
                  <Utensils className="w-8 h-8 mx-auto text-slate-600" />
                  <p className="text-sm">Your tray is empty.</p>
                  <p className="text-xs font-light">Select dishes from the menu to build your meal.</p>
                </div>
              ) : (
                cart.map(({ item, quantity }) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800/80"
                  >
                    <div className="space-y-0.5">
                      <h4 className="font-semibold text-xs text-slate-200">{item.name}</h4>
                      <p className="text-xs text-amber-400 font-mono font-bold">
                        ${(item.price * quantity).toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-bold font-mono px-1">{quantity}</span>
                      <button
                        onClick={() => addToCart(item)}
                        className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>

            {cart.length > 0 && (
              <div className="p-5 bg-slate-950 border-t border-slate-800 space-y-4">
                {/* Optional Table Number Selector */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                    Dine-In Table (Optional)
                  </label>
                  <select
                    value={selectedTableId}
                    onChange={(e) => setSelectedTableId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/30 transition"
                  >
                    <option value="">No table assigned (Takeout / Bar)</option>
                    {tables?.map((tbl) => (
                      <option key={tbl.id} value={tbl.id}>
                        Table {tbl.table_number} ({tbl.location.replace('_', ' ')})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between text-slate-300 font-mono text-sm pt-2 border-t border-slate-800/60">
                  <span>Total Amount:</span>
                  <span className="text-xl font-bold text-amber-400">
                    ${totalCartAmount.toFixed(2)}
                  </span>
                </div>

                <Button
                  variant="primary"
                  className="w-full font-bold py-3 text-sm shadow-xl shadow-amber-500/15"
                  loading={submitting}
                  onClick={handlePlaceOrder}
                >
                  Send Order to Kitchen
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
