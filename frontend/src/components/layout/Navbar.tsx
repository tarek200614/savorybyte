import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/store/useAuth';
import { useTranslation } from '@/i18n/LanguageContext';
import { LanguageSelector } from '@/components/common/LanguageSelector';
import {
  Calendar,
  ShoppingBag,
  LayoutDashboard,
  LogOut,
  Menu as MenuIcon,
  X,
  ChefHat,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function Navbar() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-midnight/95 backdrop-blur-md border-b border-champagne/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 py-3">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center group shrink-0" aria-label="SavoryByte">
            <img
              src="/assets/brand/savorybyte-logo.png"
              alt="SavoryByte"
              className="h-11 w-11 sm:h-14 sm:w-14 rounded-full object-contain shadow-lg shadow-black/50 group-hover:scale-105 transition duration-300 ring-1 ring-champagne/30 hover:ring-champagne/60"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6 rtl:space-x-reverse">
            <Link
              to="/"
              className={`text-sm font-medium transition ${
                isActive('/') ? 'text-champagne font-semibold' : 'text-stone-300 hover:text-champagne'
              }`}
            >
              {t.nav.home}
            </Link>
            <Link
              to="/menu"
              className={`text-sm font-medium transition ${
                isActive('/menu') ? 'text-champagne font-semibold' : 'text-stone-300 hover:text-champagne'
              }`}
            >
              {t.nav.menu}
            </Link>
            <Link
              to="/reservations/book"
              className={`text-sm font-medium transition ${
                isActive('/reservations/book')
                  ? 'text-champagne font-semibold'
                  : 'text-stone-300 hover:text-champagne'
              }`}
            >
              {t.nav.reservations}
            </Link>
            <Link
              to="/security"
              className={`text-sm font-medium transition ${
                isActive('/security')
                  ? 'text-champagne font-semibold'
                  : 'text-stone-300 hover:text-champagne'
              }`}
            >
              {t.nav.security}
            </Link>

            {user && (
              <>
                <Link
                  to="/my-reservations"
                  className={`text-sm font-medium transition flex items-center space-x-1.5 rtl:space-x-reverse ${
                    isActive('/my-reservations')
                      ? 'text-champagne font-semibold'
                      : 'text-stone-300 hover:text-champagne'
                  }`}
                >
                  <Calendar className="w-4 h-4 text-champagne" />
                  <span>{t.nav.myBookings}</span>
                </Link>

                <Link
                  to="/my-orders"
                  className={`text-sm font-medium transition flex items-center space-x-1.5 rtl:space-x-reverse ${
                    isActive('/my-orders')
                      ? 'text-champagne font-semibold'
                      : 'text-stone-300 hover:text-champagne'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4 text-champagne" />
                  <span>{t.nav.myOrders}</span>
                </Link>
              </>
            )}

            {user && (user.role === 'STAFF' || user.role === 'ADMIN') && (
              <div className="flex items-center space-x-2 rtl:space-x-reverse border-l rtl:border-l-0 rtl:border-r border-champagne/20 pl-3 rtl:pl-0 rtl:pr-3">
                <Link
                  to="/staff/kitchen"
                  className="text-xs font-semibold text-botanical-light hover:text-white transition flex items-center space-x-1 rtl:space-x-reverse bg-botanical/30 px-2.5 py-1.5 rounded-lg border border-botanical/50"
                >
                  <ChefHat className="w-3.5 h-3.5" />
                  <span>{t.nav.kds}</span>
                </Link>
                <Link
                  to={user.role === 'ADMIN' ? '/admin/dashboard' : '/staff/dashboard'}
                  className="text-xs font-semibold text-champagne hover:text-champagne-light transition flex items-center space-x-1 rtl:space-x-reverse bg-charcoal px-2.5 py-1.5 rounded-lg border border-champagne/20"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>{user.role === 'ADMIN' ? t.nav.admin : t.nav.staff}</span>
                </Link>
              </div>
            )}
          </div>

          {/* User Auth Menu, Language Selector & Primary CTA */}
          <div className="hidden md:flex items-center space-x-3 rtl:space-x-reverse">
            <LanguageSelector variant="desktop" />

            {user ? (
              <div className="flex items-center space-x-3 rtl:space-x-reverse bg-charcoal border border-champagne/20 px-3.5 py-1.5 rounded-xl shadow-md">
                <div className="text-right rtl:text-left">
                  <p className="text-xs font-semibold text-ivory">{user.full_name}</p>
                  <p className="text-[10px] font-mono text-champagne font-semibold">{user.role}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="p-1.5 text-stone-400 hover:text-terracotta">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="font-medium text-xs text-stone-300 hover:text-ivory">
                    {t.nav.signIn}
                  </Button>
                </Link>
                <Link to="/reservations/book">
                  <Button variant="primary" size="sm" className="font-semibold text-xs shadow-md shadow-saffron/20">
                    {t.nav.reserveTable}
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="md:hidden flex items-center space-x-2 rtl:space-x-reverse">
            <LanguageSelector variant="desktop" />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-stone-400 hover:text-ivory hover:bg-charcoal border border-champagne/20"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-champagne/15 bg-midnight px-4 py-6 space-y-4 animate-fade-in">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-semibold text-ivory py-1"
          >
            {t.nav.home}
          </Link>
          <Link
            to="/menu"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-semibold text-ivory py-1"
          >
            {t.nav.menu}
          </Link>
          <Link
            to="/reservations/book"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-semibold text-ivory py-1"
          >
            {t.nav.reservations}
          </Link>
          <Link
            to="/security"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-semibold text-ivory py-1"
          >
            {t.nav.security}
          </Link>

          {user ? (
            <>
              <Link
                to="/my-reservations"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm text-stone-300 py-1"
              >
                {t.nav.myBookings}
              </Link>
              <Link
                to="/my-orders"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm text-stone-300 py-1"
              >
                {t.nav.myOrders}
              </Link>
              {(user.role === 'STAFF' || user.role === 'ADMIN') && (
                <>
                  <Link
                    to="/staff/kitchen"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm text-botanical-light py-1 font-semibold"
                  >
                    {t.nav.kds}
                  </Link>
                  <Link
                    to={user.role === 'ADMIN' ? '/admin/dashboard' : '/staff/dashboard'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm text-champagne py-1 font-semibold"
                  >
                    {user.role === 'ADMIN' ? t.nav.admin : t.nav.staff}
                  </Link>
                </>
              )}
              <div className="pt-3 border-t border-champagne/15">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left rtl:text-right text-sm font-semibold text-terracotta py-2"
                >
                  {t.nav.signOut} ({user.full_name})
                </button>
              </div>
            </>
          ) : (
            <div className="pt-3 border-t border-champagne/15 flex flex-col space-y-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="secondary" className="w-full">
                  {t.nav.signIn}
                </Button>
              </Link>
              <Link to="/reservations/book" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" className="w-full">
                  {t.nav.reserveTable}
                </Button>
              </Link>
            </div>
          )}

          <LanguageSelector variant="mobile" />
        </div>
      )}
    </nav>
  );
}
