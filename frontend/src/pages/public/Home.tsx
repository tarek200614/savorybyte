import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/services/api';
import { MenuItem } from '@/types';
import { resolveMenuItemImage, CATEGORY_FALLBACKS } from '@/utils/menuImage';
import { useTranslation } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Sparkles,
  Calendar,
  Utensils,
  MapPin,
  ArrowRight,
  Clock,
} from 'lucide-react';

const ZONE_IMAGES: Record<string, { image: string; capacity: string }> = {
  MAIN_HALL: {
    capacity: '2 – 6',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
  },
  TERRACE: {
    capacity: '2 – 4',
    image: 'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?auto=format&fit=crop&w=800&q=80',
  },
  PRIVATE_ROOM: {
    capacity: '6 – 12',
    image: 'https://images.unsplash.com/photo-1578474846511-04ba529f0b88?auto=format&fit=crop&w=800&q=80',
  },
  BAR: {
    capacity: '1 – 4',
    image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80',
  },
};

export function Home() {
  const { t, getDish, resolveLocation, resolveCategory, formatPrice } = useTranslation();

  // Fetch real menu items from database for featured showcase
  const { data: menuItems } = useQuery<MenuItem[]>({
    queryKey: ['featured-menu-items'],
    queryFn: () => apiRequest<MenuItem[]>('/menu/items'),
  });

  // Pick exactly 3 prominent signature dishes for editorial showcase
  const featuredDishes = menuItems?.slice(0, 3) || [];

  const zoneKeys = ['MAIN_HALL', 'TERRACE', 'PRIVATE_ROOM', 'BAR'] as const;

  return (
    <div className="space-y-24 pb-20">
      {/* ─── 1. Cinematic Hero Section (Midnight Navy) ─── */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-[#08111F]">
        {/* Ambient Hero Image Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1920&q=85"
            alt="SavoryByte Fine Dining Atmosphere"
            className="w-full h-full object-cover object-center brightness-[0.22] filter"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#08111F] via-[#08111F]/60 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 pt-16">
          {/* Halal Culinary Distinction Pill */}
          <div className="inline-flex items-center space-x-2 rtl:space-x-reverse px-4 py-1.5 rounded-full bg-[#101B2E]/90 border border-champagne/30 text-champagne text-xs sm:text-sm font-medium tracking-wide backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-saffron" />
            <span>{t.home.heroPill}</span>
          </div>

          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-champagne font-mono font-medium">
              SavoryByte • Paris
            </p>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold text-ivory tracking-tight leading-[1.12]">
              {t.home.heroTitle}
            </h1>
          </div>

          <p className="text-base sm:text-lg text-stone-200 max-w-2xl mx-auto font-light leading-relaxed">
            {t.home.heroDesc}
          </p>

          {/* Editorial Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/reservations/book" className="w-full sm:w-auto">
              <Button size="lg" variant="primary" className="w-full sm:w-auto font-medium px-8 shadow-xl shadow-saffron-950/50">
                <Calendar className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2 text-white" />
                {t.home.reserveCta}
              </Button>
            </Link>

            <Link to="/menu" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto font-medium px-8 bg-[#0C1626]/80 hover:bg-[#101B2E]">
                <Utensils className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2 text-champagne" />
                {t.home.viewMenuCta}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 2. Culinary Philosophy (Warm Ivory Editorial Section) ─── */}
      <section className="bg-ivory text-charcoal py-20 px-4 sm:px-6 lg:px-8 border-y border-stone-200">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 rtl:space-x-reverse text-saffron text-xs font-mono font-semibold uppercase tracking-widest">
              <span className="w-8 h-px bg-saffron" />
              <span>{t.home.standardsSubtitle}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-charcoal tracking-tight leading-tight">
              {t.home.standardsTitle}
            </h2>

            <p className="text-stone-500 font-light leading-relaxed text-sm sm:text-base">
              {t.home.standardsDesc}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-stone-200">
              <div className="space-y-1.5">
                <h4 className="font-serif font-bold text-charcoal text-base">{t.home.halalPrimeTitle}</h4>
                <p className="text-xs text-stone-500 font-light leading-relaxed">{t.home.halalPrimeDesc}</p>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-serif font-bold text-charcoal text-base">{t.home.alcoholFreeTitle}</h4>
                <p className="text-xs text-stone-500 font-light leading-relaxed">{t.home.alcoholFreeDesc}</p>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-serif font-bold text-charcoal text-base">{t.home.mocktailsTitle}</h4>
                <p className="text-xs text-stone-500 font-light leading-relaxed">{t.home.mocktailsDesc}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-stone-300/80 bg-charcoal">
              <img
                src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80"
                alt="Culinary craftsmanship in kitchen"
                className="w-full h-[380px] object-cover hover:scale-105 transition duration-700"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. Signature Culinary Masterpieces (Midnight Navy) ─── */}
      {featuredDishes.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#182640] pb-6">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 rtl:space-x-reverse text-saffron text-xs font-mono font-medium uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5 text-saffron" />
                <span>{t.home.featuredPill}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-ivory">
                {t.home.featuredTitle}
              </h2>
            </div>

            <Link to="/menu">
              <Button variant="outline" size="sm" className="font-medium text-xs">
                {t.home.fullMenuBtn} <ArrowRight className="w-3.5 h-3.5 ml-1.5 rtl:ml-0 rtl:mr-1.5 rtl:rotate-180" />
              </Button>
            </Link>
          </div>

          {/* 3 Prominent Masterpiece Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredDishes.map((dish) => {
              const dishTrans = getDish(dish.name, dish.description);
              return (
                <div
                  key={dish.id}
                  className="rounded-2xl bg-[#0C1626] border border-[#182640] overflow-hidden flex flex-col justify-between hover:border-champagne/40 transition duration-300 shadow-xl group"
                >
                  <div className="relative h-60 overflow-hidden bg-[#050A14]">
                    <img
                      src={resolveMenuItemImage(dish)}
                      alt={dishTrans.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = CATEGORY_FALLBACKS[dish.category?.slug || ''] || CATEGORY_FALLBACKS.default;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0C1626] via-transparent to-transparent" />
                    
                    {dish.category && (
                      <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3">
                        <span className="text-[10px] font-mono uppercase tracking-wider font-semibold bg-[#08111F]/90 text-stone-300 px-2.5 py-1 rounded-md border border-[#182640]">
                          {resolveCategory(dish.category.name)}
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-3 right-3 rtl:right-auto rtl:left-3 font-mono font-bold text-base text-champagne bg-[#08111F]/95 px-3 py-1 rounded-lg border border-champagne/30" dir="ltr">
                      {formatPrice(dish.price)}
                    </div>
                  </div>

                  <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-serif font-bold text-lg text-ivory group-hover:text-champagne-light transition">
                        {dishTrans.name}
                      </h3>
                      <p className="text-xs text-stone-400 font-light mt-2 line-clamp-2 leading-relaxed">
                        {dishTrans.description}
                      </p>
                    </div>

                    <div className="pt-4 flex items-center justify-between border-t border-[#182640] text-xs">
                      <span className="text-stone-400 font-mono text-[11px] flex items-center space-x-1 rtl:space-x-reverse">
                        <Clock className="w-3.5 h-3.5 text-champagne" />
                        <span>{dish.preparation_time_mins} {t.common.mins}</span>
                      </span>
                      <Link to="/menu" className="text-saffron-light hover:text-saffron font-medium flex items-center space-x-1 rtl:space-x-reverse transition">
                        <span>{t.home.orderNow}</span>
                        <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ─── 4. Dining Environments Showcase ─── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 rtl:space-x-reverse px-3 py-1 rounded-full bg-[#0C1626] border border-[#182640] text-champagne text-xs font-mono uppercase tracking-widest">
            <MapPin className="w-3.5 h-3.5 text-champagne" />
            <span>{t.home.seatingOptionsPill}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-ivory tracking-tight">
            {t.home.diningSettingsTitle}
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 max-w-lg mx-auto font-light">
            {t.home.diningSettingsDesc}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {zoneKeys.map((key) => {
            const locInfo = resolveLocation(key);
            const zoneMeta = ZONE_IMAGES[key];
            return (
              <div
                key={key}
                className="rounded-2xl bg-[#0C1626] border border-[#182640] overflow-hidden hover:border-champagne/30 transition duration-300 flex flex-col justify-between shadow-lg group"
              >
                <div className="relative h-44 overflow-hidden bg-[#050A14]">
                  <img
                    src={zoneMeta.image}
                    alt={`${locInfo.name} seating`}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <Badge variant="amber" className="absolute top-3 right-3 rtl:right-auto rtl:left-3 text-[10px]">
                    {t.reservations.capacity.replace('{count}', zoneMeta.capacity)}
                  </Badge>
                </div>

                <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif font-bold text-base text-ivory">
                      {locInfo.name}
                    </h3>
                    <p className="text-xs text-stone-400 font-light mt-1 leading-relaxed">
                      {locInfo.subtitle}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#182640]">
                    <Link
                      to="/reservations/book"
                      className="text-xs font-medium text-champagne-light flex items-center space-x-1 rtl:space-x-reverse hover:text-champagne transition"
                    >
                      <span>{t.home.reserveInArea}</span>
                      <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── 5. Service Times & Reservation Call to Action ─── */}
      <section className="max-w-4xl mx-auto px-4 text-center space-y-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#0C1626] border border-[#182640] space-y-6 shadow-2xl">
          <div className="space-y-3">
            <p className="text-xs font-mono uppercase tracking-widest text-champagne">
              Hospitality Service
            </p>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-ivory">
              {t.home.planVisitTitle}
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 max-w-lg mx-auto font-light leading-relaxed">
              {t.home.planVisitDesc}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto text-xs font-mono pt-2">
            <div className="p-3 rounded-xl bg-[#08111F] border border-[#182640] text-stone-300">
              <span className="block text-champagne font-bold mb-0.5">{t.home.dinnerService}</span>
              <span>{t.home.dinnerDays} • {t.home.dinnerHours}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#08111F] border border-[#182640] text-stone-300">
              <span className="block text-champagne font-bold mb-0.5">{t.home.weekendLunch}</span>
              <span>{t.home.weekendDays} • {t.home.weekendHours}</span>
            </div>
          </div>

          <div className="pt-2 flex justify-center">
            <Link to="/reservations/book">
              <Button size="lg" variant="primary" className="font-semibold px-10 shadow-xl shadow-saffron-950/50">
                <Calendar className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
                {t.home.reserveCta}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
