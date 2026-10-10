import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/services/api';
import { DashboardSummary } from '@/types';
import { useTranslation } from '@/i18n/LanguageContext';
import { Card, CardContent } from '@/components/ui/Card';
import { CardSkeleton } from '@/components/feedback/Skeleton';
import {
  LayoutDashboard,
  DollarSign,
  Calendar,
  Users,
  UtensilsCrossed,
  TrendingUp,
  Table,
  BookOpen,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export function AdminDashboard() {
  const { t, formatPrice } = useTranslation();

  const { data: metrics, isLoading } = useQuery<DashboardSummary>({
    queryKey: ['admin-dashboard'],
    queryFn: () => apiRequest<DashboardSummary>('/admin/analytics/dashboard'),
    refetchInterval: 30000, // Auto-refresh every 30s
  });

  const kpiCards = [
    {
      title: t.admin.totalRevenue,
      value: metrics ? formatPrice(metrics.total_revenue) : '—',
      icon: DollarSign,
      color: 'text-champagne',
      bg: 'bg-midnight border-champagne/30',
    },
    {
      title: t.admin.todayReservations,
      value: metrics?.reservations_today?.toString() || '—',
      icon: Calendar,
      color: 'text-saffron',
      bg: 'bg-midnight border-saffron/30',
    },
    {
      title: t.admin.activeTables,
      value: metrics?.total_tables?.toString() || '—',
      icon: UtensilsCrossed,
      color: 'text-botanical-light',
      bg: 'bg-midnight border-botanical/30',
    },
    {
      title: t.admin.registeredUsers,
      value: metrics?.total_users?.toString() || '—',
      icon: Users,
      color: 'text-champagne-light',
      bg: 'bg-midnight border-champagne/20',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-ivory flex items-center space-x-3 rtl:space-x-reverse">
            <LayoutDashboard className="w-8 h-8 text-champagne" />
            <span>{t.admin.title}</span>
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            {t.admin.subtitle}
          </p>
        </div>

        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <Link to="/admin/tables">
            <Button variant="outline" size="sm" className="font-semibold text-xs">
              <Table className="w-4 h-4 mr-1.5 rtl:mr-0 rtl:ml-1.5" />
              {t.admin.manageTables}
            </Button>
          </Link>
          <Link to="/admin/menu">
            <Button variant="primary" size="sm" className="font-semibold text-xs shadow-md shadow-saffron/20">
              <BookOpen className="w-4 h-4 mr-1.5 rtl:mr-0 rtl:ml-1.5" />
              {t.admin.manageMenu}
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <Card
                key={kpi.title}
                className="border-champagne/15 bg-charcoal hover:border-champagne/40 transition shadow-xl"
              >
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-stone-400 font-mono uppercase tracking-wider">
                      {kpi.title}
                    </p>
                    <p className="text-2xl font-bold font-mono text-ivory" dir="ltr">
                      {kpi.value}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${kpi.bg}`}>
                    <Icon className={`w-6 h-6 ${kpi.color}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Quick Navigation & Operational Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-champagne/15 bg-charcoal shadow-xl">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-champagne/15 pb-3">
              <h3 className="font-serif font-bold text-lg text-ivory flex items-center space-x-2 rtl:space-x-reverse">
                <TrendingUp className="w-5 h-5 text-champagne" />
                <span>{t.nav.staff}</span>
              </h3>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed font-light">
              {t.kds.subtitle}
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link to="/staff/kitchen">
                <Button variant="secondary" className="w-full text-xs font-semibold">
                  {t.nav.kds}
                </Button>
              </Link>
              <Link to="/staff/dashboard">
                <Button variant="secondary" className="w-full text-xs font-semibold">
                  {t.nav.staff}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="border-champagne/15 bg-charcoal shadow-xl">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-champagne/15 pb-3">
              <h3 className="font-serif font-bold text-lg text-ivory flex items-center space-x-2 rtl:space-x-reverse">
                <BookOpen className="w-5 h-5 text-champagne" />
                <span>{t.admin.manageMenu}</span>
              </h3>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed font-light">
              {t.admin.subtitle}
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link to="/admin/menu">
                <Button variant="secondary" className="w-full text-xs font-semibold">
                  {t.admin.manageMenu}
                </Button>
              </Link>
              <Link to="/admin/tables">
                <Button variant="secondary" className="w-full text-xs font-semibold">
                  {t.admin.manageTables}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
