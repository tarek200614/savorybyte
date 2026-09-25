import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Sparkles,
  Calendar,
  Utensils,
  ShieldCheck,
  MapPin,
  Star,
  ArrowRight,
  Leaf,
} from 'lucide-react';

const DINING_ZONES = [
  {
    name: 'The Grand Dining Hall',
    location: 'MAIN_HALL',
    description: 'Immersive dark-ambient luxury with handcrafted crystal chandeliers and intimate banquet seating.',
    capacity: '2 – 6 Guests',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'The Glasshouse Garden Terrace',
    location: 'TERRACE',
    description: 'Al fresco botanical dining under atmospheric canopy lighting and climate-controlled terrace glass.',
    capacity: '2 – 4 Guests',
    image: 'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Executive Majlis & VIP Salon',
    location: 'PRIVATE_ROOM',
    description: 'Secluded private dining suites with bespoke service, hand-carved arabesque accents, and dedicated sommelier.',
    capacity: '6 – 12 Guests',
    image: 'https://images.unsplash.com/photo-1578474846511-04ba529f0b88?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Botanical Mocktail Lounge',
    location: 'BAR',
    description: 'Artisanal mixology counter crafting flamed herb infusions, saffron elixirs, and cold-pressed mocktails.',
    capacity: '1 – 4 Guests',
    image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80',
  },
];

const SIGNATURE_DISHES = [
  {
    name: 'Halal A5 Japanese Wagyu Ribeye',
    category: 'Prime Cuts',
    price: '$98.00',
    description: '100% Halal-certified Miyazaki Wagyu, black garlic jus, silk pomme purée, roasted bone marrow.',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    dietary: 'Gluten-Free',
  },
  {
    name: 'Slow-Braised Royal Lamb Shank',
    category: 'Signatures',
    price: '$48.00',
    description: '8-hour slow braised pasture-raised lamb, saffron pearl couscous, Turkish apricots, toasted almonds.',
    image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=600&q=80',
    dietary: 'Halal Prime',
  },
  {
    name: 'Pan-Seared Chilean Sea Bass',
    category: 'Ocean Catch',
    price: '$58.00',
    description: 'Miso-glazed sustainable sea bass, lemongrass dashi broth, charred bok choy, wild shiitake.',
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80',
    dietary: 'Gluten-Free',
  },
  {
    name: 'Royal Saffron Pomegranate Fizz',
    category: 'Artisan Mocktail',
    price: '$16.00',
    description: 'Cold-pressed ruby pomegranate, Kashmiri saffron threads, organic rose essence, sparkling water.',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
    dietary: 'Alcohol-Free',
  },
];

export function Home() {
  return (
    <div className="space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Ambient Hero Image Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1920&q=85"
            alt="SavoryByte Luxury Dining Room"
            className="w-full h-full object-cover object-center brightness-[0.28] filter"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 pt-12">
          {/* Halal Assurance Pill */}
          <div className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-semibold tracking-wide backdrop-blur-md shadow-lg shadow-amber-500/5">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>100% Halal-Certified Ingredients • Strictly Alcohol-Free & Pork-Free Kitchen</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-100 tracking-tight leading-[1.1]">
            Exceptional Dining.{' '}
            <span className="block bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
              Thoughtfully Halal.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
            Welcome to SavoryByte, where Michelin-grade culinary precision meets pure, halal-certified gastronomy. Indulge in certified Japanese Wagyu, artisanal mezze, and botanical mocktails in an unforgettable setting.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/reservations/book" className="w-full sm:w-auto">
              <Button size="lg" variant="primary" className="w-full sm:w-auto font-bold px-8 shadow-xl shadow-amber-500/20">
                <Calendar className="w-5 h-5 mr-2" />
                Reserve a Table
              </Button>
            </Link>

            <Link to="/menu" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto font-semibold px-8 border-slate-700 bg-slate-900/60 hover:bg-slate-900">
                <Utensils className="w-5 h-5 mr-2" />
                Explore Gourmet Menu
              </Button>
            </Link>
          </div>

          {/* Key Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 border-t border-slate-800/80 text-left">
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-sm">
              <div className="text-2xl font-black text-amber-400 font-mono">100%</div>
              <div className="text-xs text-slate-400 font-medium mt-0.5">Halal-Certified Meats</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-sm">
              <div className="text-2xl font-black text-emerald-400 font-mono">0.0%</div>
              <div className="text-xs text-slate-400 font-medium mt-0.5">Alcohol & Pork Free</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-sm">
              <div className="text-2xl font-black text-amber-400 font-mono">4 Zones</div>
              <div className="text-xs text-slate-400 font-medium mt-0.5">Distinct Dining Ambiences</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-sm">
              <div className="text-2xl font-black text-blue-400 font-mono">Real-Time</div>
              <div className="text-xs text-slate-400 font-medium mt-0.5">Instant Booking Guarantee</div>
            </div>
          </div>
        </div>
      </section>

      {/* Halal Standards & Culinary Philosophy */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Our Halal Integrity Pledge</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight leading-tight">
              Uncompromising Standards.<br />
              Zero Alcohol. Pure Gastronomy.
            </h2>

            <p className="text-slate-300 font-light leading-relaxed">
              At SavoryByte, our culinary philosophy is grounded in total transparency and reverence for our guests. We source exclusively from certified halal livestock farms with documented ethical slaughter, humane care, and unadulterated provenance.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-100 text-sm">Certified Halal Prime Meats</h4>
                  <p className="text-xs text-slate-400 font-light mt-0.5">Japanese A5 Wagyu, Australian Black Angus, and pasture-raised lamb with verified certifications.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-0.5">
                  <Leaf className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-100 text-sm">Strictly Alcohol-Free & Gelatin-Free</h4>
                  <p className="text-xs text-slate-400 font-light mt-0.5">Zero cooking wines, zero alcohol extracts, and zero non-halal animal gelatins in our sauces, desserts, and mocktails.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 flex-shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-100 text-sm">Artisanal Botanical Mixology</h4>
                  <p className="text-xs text-slate-400 font-light mt-0.5">Award-winning house-crafted mocktails featuring flamed botanicals, cold-pressed elixirs, and saffron infusions.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl shadow-amber-500/5">
              <img
                src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80"
                alt="Chef preparing Halal Wagyu"
                className="w-full h-[450px] object-cover hover:scale-105 transition duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 backdrop-blur-md">
                <p className="text-xs font-mono text-amber-400 font-bold uppercase">Executive Culinary Standard</p>
                <p className="text-sm font-semibold text-slate-100 mt-1">"Elevating Halal Dining to Fine-Art Gastronomy"</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dining Environments & Zones Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <MapPin className="w-4 h-4" />
            <span>Four Distinct Ambiences</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-100 tracking-tight">
            Curated Dining Environments
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto font-light">
            Choose the perfect atmosphere for family celebrations, intimate date nights, or executive private meetings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {DINING_ZONES.map((zone) => (
            <div
              key={zone.name}
              className="group rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden hover:border-amber-500/40 transition duration-300 flex flex-col justify-between"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={zone.image}
                  alt={zone.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                <Badge variant="amber" className="absolute top-3 right-3 shadow-md">
                  {zone.capacity}
                </Badge>
              </div>

              <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-lg text-slate-100 group-hover:text-amber-400 transition">
                    {zone.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-light mt-1 leading-relaxed">
                    {zone.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/80">
                  <Link
                    to="/reservations/book"
                    className="text-xs font-bold text-amber-400 flex items-center space-x-1 hover:text-amber-300 transition"
                  >
                    <span>Reserve in this Zone</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Signature Dishes Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Culinary Masterpieces</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-100">Signature Menu Highlights</h2>
          </div>

          <Link to="/menu">
            <Button variant="outline" size="sm" className="font-semibold">
              View Full Menu <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SIGNATURE_DISHES.map((dish) => (
            <div
              key={dish.name}
              className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={dish.image}
                  alt={dish.name}
                  className="w-full h-full object-cover hover:scale-105 transition duration-500"
                />
                <div className="absolute top-3 left-3">
                  <Badge variant="slate" className="bg-slate-950/80 backdrop-blur-md">
                    {dish.category}
                  </Badge>
                </div>
                <div className="absolute bottom-3 right-3 font-mono font-extrabold text-lg text-amber-400 bg-slate-950/90 px-2.5 py-1 rounded-xl border border-amber-500/20 backdrop-blur-md">
                  {dish.price}
                </div>
              </div>

              <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-100">{dish.name}</h3>
                  <p className="text-xs text-slate-400 font-light mt-1 leading-relaxed">
                    {dish.description}
                  </p>
                </div>

                <div className="pt-3 flex items-center justify-between border-t border-slate-800/60 text-xs">
                  <span className="text-emerald-400 font-mono flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{dish.dietary}</span>
                  </span>
                  <Link to="/menu" className="text-amber-400 font-semibold hover:underline">
                    Order Now →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Social Proof & Guest Reviews */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-8">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400" />
              ))}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">
              Praised by Discriminating Palates Worldwide
            </h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Read authentic reviews from guests celebrating milestones, business dinners, and family gatherings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
              <p className="text-xs text-slate-300 italic leading-relaxed">
                "The A5 Halal Wagyu is simply extraordinary. Having fine-dining of this caliber with 100% peace of mind on halal standards and zero alcohol is an absolute game-changer."
              </p>
              <div className="pt-2 border-t border-slate-800 flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center font-mono">
                  FA
                </div>
                <div>
                  <h5 className="font-bold text-xs text-slate-100">Fariq Al-Mansoor</h5>
                  <p className="text-[10px] text-slate-500">Executive Guest • Majlis Suite</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
              <p className="text-xs text-slate-300 italic leading-relaxed">
                "The garden terrace atmosphere was breathtaking. The Moroccan mint tea service and pistachio milk cake made our wedding anniversary dinner truly unforgettable."
              </p>
              <div className="pt-2 border-t border-slate-800 flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center font-mono">
                  ZM
                </div>
                <div>
                  <h5 className="font-bold text-xs text-slate-100">Zahra & Tariq Malik</h5>
                  <p className="text-[10px] text-slate-500">Verified Diner • Terrace</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
              <p className="text-xs text-slate-300 italic leading-relaxed">
                "The reservation system with live table selection worked flawlessly. Zero waiting time when we arrived. SavoryByte sets the gold standard for modern dining."
              </p>
              <div className="pt-2 border-t border-slate-800 flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center font-mono">
                  KH
                </div>
                <div>
                  <h5 className="font-bold text-xs text-slate-100">Karim Haddad</h5>
                  <p className="text-[10px] text-slate-500">Regular Diner • Main Hall</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Reservation Call to Action */}
      <section className="max-w-5xl mx-auto px-4 text-center">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100">
            Experience Unmatched Gastronomic Luxury
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto font-light leading-relaxed">
            Tables are allocated with real-time overlap prevention to guarantee immediate seating upon your arrival.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link to="/reservations/book">
              <Button size="lg" variant="primary" className="font-bold px-8 shadow-xl shadow-amber-500/20">
                <Calendar className="w-5 h-5 mr-2" />
                Book Your Experience
              </Button>
            </Link>
            <Link to="/menu">
              <Button size="lg" variant="ghost" className="font-semibold text-slate-300 hover:text-amber-400">
                View Food & Mocktail Menu →
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
