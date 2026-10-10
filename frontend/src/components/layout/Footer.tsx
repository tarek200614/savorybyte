import { ShieldCheck, MapPin, Clock, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n/LanguageContext';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-midnight border-t border-champagne/15 pt-16 pb-12 text-stone-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Halal Statement */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center group shrink-0" aria-label="SavoryByte">
              <img
                src="/assets/brand/savorybyte-logo.png"
                alt="SavoryByte"
                className="h-14 w-14 rounded-full object-contain shadow-xl shadow-black/50 group-hover:scale-105 transition duration-300 ring-1 ring-champagne/30 hover:ring-champagne/60"
              />
            </Link>
            <p className="text-xs text-stone-400 leading-relaxed font-light">
              {t.footer.halalPledge}
            </p>
            <div className="inline-flex items-center space-x-1.5 rtl:space-x-reverse px-2.5 py-1 rounded-lg bg-charcoal border border-champagne/20 text-champagne text-[11px] font-mono font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-champagne" />
              <span>{t.footer.halalCertifiedBadge}</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-ivory uppercase tracking-wider font-mono">
              {t.footer.exploreHeader}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-champagne transition">
                  {t.footer.homeLink}
                </Link>
              </li>
              <li>
                <Link to="/menu" className="hover:text-champagne transition">
                  {t.footer.menuLink}
                </Link>
              </li>
              <li>
                <Link to="/reservations/book" className="hover:text-champagne transition">
                  {t.footer.reserveLink}
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-champagne transition">
                  {t.footer.signInLink}
                </Link>
              </li>
              <li>
                <Link to="/security" className="hover:text-champagne transition flex items-center gap-1.5">
                  <span className="text-saffron">{t.nav.security}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Hours of Operation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-ivory uppercase tracking-wider font-mono flex items-center space-x-1.5 rtl:space-x-reverse">
              <Clock className="w-3.5 h-3.5 text-champagne" />
              <span>{t.footer.diningHoursHeader}</span>
            </h4>
            <div className="space-y-1.5 text-xs text-stone-400">
              <p className="flex justify-between">
                <span>{t.home.dinnerDays}:</span>
                <span className="text-stone-200 font-mono">{t.footer.weekdaysSchedule}</span>
              </p>
              <p className="flex justify-between">
                <span>{t.home.weekendDays}:</span>
                <span className="text-stone-200 font-mono">{t.footer.weekendsSchedule}</span>
              </p>
              <p className="text-[11px] text-champagne/80 pt-1">
                *{t.footer.kitchenNotice}
              </p>
            </div>
          </div>

          {/* Col 4: Location & Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-ivory uppercase tracking-wider font-mono flex items-center space-x-1.5 rtl:space-x-reverse">
              <MapPin className="w-3.5 h-3.5 text-champagne" />
              <span>{t.footer.locationHeader}</span>
            </h4>
            <div className="space-y-2 text-xs text-stone-400">
              <p>{t.footer.address}</p>
              <p className="flex items-center space-x-2 rtl:space-x-reverse text-stone-300">
                <Phone className="w-3.5 h-3.5 text-champagne" />
                <span dir="ltr">+1 (555) 839-2983</span>
              </p>
              <p className="flex items-center space-x-2 rtl:space-x-reverse text-stone-300">
                <Mail className="w-3.5 h-3.5 text-champagne" />
                <span dir="ltr">concierge@savorybyte.com</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="border-t border-champagne/15 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500">
          <p>{t.footer.copyright}</p>
          <div className="flex items-center space-x-6 rtl:space-x-reverse mt-4 sm:mt-0">
            <span className="text-stone-400">{t.common.halalCertified}</span>
            <span>•</span>
            <span className="text-stone-400">{t.common.fourDistinctAmbiences}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
