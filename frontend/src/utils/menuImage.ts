import { MenuItem } from '@/types';

/**
 * Category-specific food photography fallback URLs.
 * Every fallback is verified to return HTTP 200 on Unsplash.
 */
export const CATEGORY_FALLBACKS: Record<string, string> = {
  starters: 'https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=800&q=80',
  grill: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
  seafood: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
  desserts: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80',
  beverages: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
  default: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
};

/** Known verified dish images for specific high-profile items */
const DISH_SPECIFIC_OVERRIDES: Record<string, string> = {
  'truffle burrata pugliese': 'https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=800&q=80',
  'ceremonial uji matcha tart': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
};

/**
 * Resolves the appropriate image URL for a menu item.
 * Priority:
 * 1. Known dish-specific override if image is known broken/deprecated
 * 2. item.image_url (exact dish photography from database if valid)
 * 3. category fallback (appropriate culinary category image)
 * 4. default gourmet food fallback
 */
export function resolveMenuItemImage(item: Partial<MenuItem> | undefined | null): string {
  if (!item) return CATEGORY_FALLBACKS.default;

  const normalizedName = (item.name || '').toLowerCase().trim();
  if (DISH_SPECIFIC_OVERRIDES[normalizedName]) {
    return DISH_SPECIFIC_OVERRIDES[normalizedName];
  }

  if (
    item.image_url &&
    item.image_url.trim().length > 0 &&
    !item.image_url.includes('photo-1592417817098-8f3d691068a8') &&
    !item.image_url.includes('photo-1535141192574-5d4897c13136')
  ) {
    return item.image_url;
  }

  if (normalizedName.includes('burrata')) {
    return 'https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=800&q=80';
  }
  if (normalizedName.includes('matcha')) {
    return 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80';
  }

  const slug = item.category?.slug?.toLowerCase();
  if (slug && CATEGORY_FALLBACKS[slug]) {
    return CATEGORY_FALLBACKS[slug];
  }

  return CATEGORY_FALLBACKS.default;
}
