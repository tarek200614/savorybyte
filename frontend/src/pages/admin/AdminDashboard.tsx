import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/services/api';
import { DashboardSummary } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';
import { CardSkeleton } from '@/components/feedback/Skeleton';
import {
  LayoutDashboard,
  DollarSign,
  Calendar,
  Users,
  UtensilsCrossed,
  TrendingUp,
} from 'lucide-react';

export function AdminDashboard() {
  const { data: metrics, isLoading } = useQuery<DashboardSummary>({
    queryKey: ['admin-dashboard'],
    queryFn: () => apiRequest<DashboardSummary>('/admin/analytics/dashboard'),
    refetchInterval: 30000, // Auto-refresh every 30s
  });

  const kpiCards = [
    {
      title: 'Total Revenue',
      value: metrics ? `$${Number(metrics.total_revenue).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—',
      icon: DollarSign,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: "Today's Reservations",
      value: metrics?.reservations_today?.toString() || '—',
      icon: Calendar,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      title: 'Active Tables',
      value: metrics?.total_tables?.toString() || '—',
      icon: UtensilsCrossed,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      title: 'Registered Users',
      value: metrics?.total_users?.toString() || '—',
      icon: Users,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 flex items-center space-x-3">
            <LayoutDashboard className="w-8 h-8 text-amber-400" />
            <span>Executive Dashboard</span>
          </h1>
          <p className="text-sm text-slate-400 font-light mt-1">
            SavoryByte SaaS — Real-time operational intelligence
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-slate-500">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>Live metrics • auto-refreshing every 30s</span>
        </div>
      </div>

      {/* KPI Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiCards.map((kpi) => (
            <Card key={kpi.title}>
              <CardContent className="p-6 flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {kpi.title}
                  </p>
                  <p className="text-3xl font-extrabold text-slate-100 font-mono">
                    {kpi.value}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${kpi.bg} ${kpi.color}`}
                >
                  <kpi.icon className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Admin Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <a
          href="/admin/tables"
          className="block p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/30 transition group"
        >
          <UtensilsCrossed className="w-6 h-6 text-amber-400 mb-3" />
          <h3 className="font-bold text-slate-100 group-hover:text-amber-400 transition">
            Manage Tables
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Add, edit, or deactivate restaurant tables
          </p>
        </a>

        <a
          href="/admin/menu"
          className="block p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/30 transition group"
        >
          <DollarSign className="w-6 h-6 text-amber-400 mb-3" />
          <h3 className="font-bold text-slate-100 group-hover:text-amber-400 transition">
            Manage Menu
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Create categories, add menu items, update prices
          </p>
        </a>

        <a
          href="/staff/kitchen"
          className="block p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/30 transition group"
        >
          <Calendar className="w-6 h-6 text-amber-400 mb-3" />
          <h3 className="font-bold text-slate-100 group-hover:text-amber-400 transition">
            Kitchen Display
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Live order queue and kitchen workflow management
          </p>
        </a>
      </div>
    </div>
  );
}
