import { Utensils, ShieldCheck, MapPin, Clock, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 pt-16 pb-12 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Halal Statement */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Utensils className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
                SavoryByte
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed font-light">
              Elevating fine dining through certified Halal culinary mastery. Zero alcohol, zero pork, and 100% ethical sourcing.
            </p>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Halal Certified Kitchen</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
              Explore & Reserve
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-amber-400 transition">
                  Home & Ambiance
                </Link>
              </li>
              <li>
                <Link to="/menu" className="hover:text-amber-400 transition">
                  Gourmet Halal Menu
                </Link>
              </li>
              <li>
                <Link to="/reservations/book" className="hover:text-amber-400 transition">
                  Book a Table Online
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-amber-400 transition">
                  Customer Portal Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Hours of Operation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Dining Hours</span>
            </h4>
            <div className="space-y-1.5 text-xs text-slate-400">
              <p className="flex justify-between">
                <span>Monday – Thursday:</span>
                <span className="text-slate-200 font-mono">17:00 – 23:00</span>
              </p>
              <p className="flex justify-between">
                <span>Friday – Saturday:</span>
                <span className="text-slate-200 font-mono">16:00 – 00:00</span>
              </p>
              <p className="flex justify-between">
                <span>Sunday (Brunch & Dinner):</span>
                <span className="text-slate-200 font-mono">12:00 – 22:30</span>
              </p>
              <p className="text-[11px] text-amber-400/80 pt-1">
                *Kitchen closes 45 mins prior to closing.
              </p>
            </div>
          </div>

          {/* Col 4: Location & Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Location & Contact</span>
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <p>450 Grand Avenue, Financial & Cultural District</p>
              <p className="flex items-center space-x-2 text-slate-300">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>+1 (555) 839-2983</span>
              </p>
              <p className="flex items-center space-x-2 text-slate-300">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>concierge@savorybyte.com</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Legal */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 SavoryByte Restaurant & Management SaaS. All rights reserved.</p>
          <div className="flex space-x-6">
            <span className="hover:text-slate-400 cursor-pointer">Halal Standards Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Privacy & Terms</span>
            <span className="hover:text-slate-400 cursor-pointer">API Docs</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
