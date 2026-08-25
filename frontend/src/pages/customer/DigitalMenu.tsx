import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/services/api';
import { Category, MenuItem, Order } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { CardSkeleton } from '@/components/feedback/Skeleton';
import { Utensils, ShoppingBag, Plus, Minus, CheckCircle2, Leaf } from 'lucide-react';

interface CartItem {
  item: MenuItem;
  quantity: number;
}

export function DigitalMenu() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch categories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => apiRequest<Category[]>('/menu/categories'),
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
          items: cart.map((i) => ({
            menu_item_id: i.item.id,
            quantity: i.quantity,
          })),
        }),
      });

      setOrderSuccess(order.order_number);
      setCart([]);
    } catch (err: unknown) {
      alert((err as Error).message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Menu Browsing Main Section */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-100 flex items-center space-x-3">
              <Utensils className="w-8 h-8 text-amber-400" />
              <span>Digital Gourmet Menu</span>
            </h1>
            <p className="text-sm text-slate-400 font-light mt-1">
              Explore exquisite dishes prepared by executive chefs
            </p>
          </div>

          {/* Search Input */}
          <div className="w-full sm:w-64">
            <Input
              placeholder="Search dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

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
            All Items
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

        {orderSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center space-x-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
            <div>
              <p className="font-bold text-sm">Order Placed Successfully!</p>
              <p className="text-xs text-emerald-400/90 font-mono">
                Order Reference: {orderSuccess}
              </p>
            </div>
          </div>
        )}

        {/* Food Items Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {menuItems?.map((item) => (
              <Card key={item.id} className="flex flex-col justify-between">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-slate-100">{item.name}</h3>
                      <p className="text-xs text-slate-400 font-light mt-1">
                        {item.description || 'Delicately crafted gourmet dish'}
                      </p>
                    </div>
                    <span className="text-lg font-extrabold text-amber-400 font-mono">
                      ${Number(item.price).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    {item.is_vegetarian && (
                      <Badge variant="emerald" className="gap-1">
                        <Leaf className="w-3 h-3" /> Veg
                      </Badge>
                    )}
                    {item.is_gluten_free && <Badge variant="purple">GF</Badge>}
                    <Badge variant="slate">{item.preparation_time_mins} mins</Badge>
                  </div>
                </CardContent>

                <div className="p-4 bg-slate-950/40 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-mono">
                    {item.is_available ? 'Available' : 'Sold Out'}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!item.is_available}
                    onClick={() => addToCart(item)}
                  >
                    <Plus className="w-4 h-4" /> Add to Order
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Cart & Checkout Panel */}
      <div className="space-y-4">
        <Card className="sticky top-24">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <h2 className="font-bold text-lg text-slate-100 flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <span>Your Food Order</span>
            </h2>
            <Badge variant="amber">{cart.reduce((sum, i) => sum + i.quantity, 0)} Items</Badge>
          </div>

          <CardContent className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
            {cart.length === 0 ? (
              <div className="text-center py-8 text-slate-500 space-y-2">
                <Utensils className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-sm">Your cart is empty.</p>
                <p className="text-xs font-light">Add items from the menu to build your order.</p>
              </div>
            ) : (
              cart.map(({ item, quantity }) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800"
                >
                  <div>
                    <h4 className="font-semibold text-sm text-slate-200">{item.name}</h4>
                    <p className="text-xs text-amber-400 font-mono">
                      ${(item.price * quantity).toFixed(2)}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold font-mono px-1">{quantity}</span>
                    <button
                      onClick={() => addToCart(item)}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
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
              <div className="flex items-center justify-between text-slate-300 font-mono text-sm">
                <span>Total Amount:</span>
                <span className="text-xl font-bold text-amber-400">
                  ${totalCartAmount.toFixed(2)}
                </span>
              </div>

              <Button
                variant="primary"
                className="w-full font-bold py-3"
                loading={submitting}
                onClick={handlePlaceOrder}
              >
                Submit Order to Kitchen
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
