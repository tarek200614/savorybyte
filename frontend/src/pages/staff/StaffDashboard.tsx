import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/services/api';
import { Reservation, ReservationStatus } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { CardSkeleton } from '@/components/feedback/Skeleton';
import {
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  UserCheck,
  LogOut,
  Filter,
} from 'lucide-react';

const STATUS_TRANSITIONS: Record<ReservationStatus, { label: string; next: ReservationStatus; icon: typeof CheckCircle2; variant: 'primary' | 'danger' | 'secondary' }[]> = {
  PENDING: [
    { label: 'Confirm', next: 'CONFIRMED', icon: CheckCircle2, variant: 'primary' },
    { label: 'Cancel', next: 'CANCELLED', icon: XCircle, variant: 'danger' },
  ],
  CONFIRMED: [
    { label: 'Seat Guest', next: 'SEATED', icon: UserCheck, variant: 'primary' },
    { label: 'No Show', next: 'NO_SHOW', icon: XCircle, variant: 'danger' },
    { label: 'Cancel', next: 'CANCELLED', icon: XCircle, variant: 'danger' },
  ],
  SEATED: [
    { label: 'Complete', next: 'COMPLETED', icon: LogOut, variant: 'primary' },
  ],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
};

const STATUS_BADGE_MAP: Record<string, 'emerald' | 'amber' | 'blue' | 'purple' | 'rose' | 'slate'> = {
  PENDING: 'amber',
  CONFIRMED: 'emerald',
  SEATED: 'blue',
  COMPLETED: 'purple',
  CANCELLED: 'rose',
  NO_SHOW: 'slate',
};

type FilterStatus = ReservationStatus | 'ALL';

export function StaffDashboard() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('ALL');

  const { data: reservations, isLoading } = useQuery<Reservation[]>({
    queryKey: ['staff-reservations'],
    queryFn: () => apiRequest<Reservation[]>('/reservations'),
    refetchInterval: 15000, // Auto-refresh every 15 seconds
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ReservationStatus }) =>
      apiRequest<Reservation>(`/reservations/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-reservations'] });
    },
  });

  const filtered = reservations?.filter(
    (r) => statusFilter === 'ALL' || r.status === statusFilter
  );

  const statusCounts = reservations?.reduce(
    (acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const filterOptions: { label: string; value: FilterStatus }[] = [
    { label: `All (${reservations?.length || 0})`, value: 'ALL' },
    { label: `Pending (${statusCounts?.PENDING || 0})`, value: 'PENDING' },
    { label: `Confirmed (${statusCounts?.CONFIRMED || 0})`, value: 'CONFIRMED' },
    { label: `Seated (${statusCounts?.SEATED || 0})`, value: 'SEATED' },
    { label: `Completed (${statusCounts?.COMPLETED || 0})`, value: 'COMPLETED' },
  ];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 flex items-center space-x-3">
            <Calendar className="w-8 h-8 text-amber-400" />
            <span>Staff Reservation Manager</span>
          </h1>
          <p className="text-sm text-slate-400 font-light mt-1">
            View, confirm, seat, and manage all dining reservations in real-time
          </p>
        </div>

        <div className="text-xs font-mono text-slate-500 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
          Auto-refreshing every 15s
        </div>
      </div>

      {/* Status Filter Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        <Filter className="w-4 h-4 text-slate-500 flex-shrink-0" />
        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStatusFilter(opt.value)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              statusFilter === opt.value
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Reservation Cards */}
      {isLoading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : !filtered || filtered.length === 0 ? (
        <EmptyState
          title="No Reservations Found"
          description="No reservations match the current filter."
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((res) => (
            <Card key={res.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Reservation Info */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-3 flex-wrap gap-y-1">
                      <span className="font-bold text-lg text-slate-100">
                        Table {res.table?.table_number || 'N/A'}
                      </span>
                      <Badge variant={STATUS_BADGE_MAP[res.status] || 'slate'}>
                        {res.status}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs text-slate-400 font-mono">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        <span>{res.reservation_date}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>{res.start_time} – {res.end_time}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Users className="w-3.5 h-3.5 text-amber-400" />
                        <span>{res.party_size} Guests</span>
                      </span>
                    </div>

                    {res.special_requests && (
                      <p className="text-xs text-slate-500 italic">
                        Note: "{res.special_requests}"
                      </p>
                    )}
                  </div>

                  {/* Right: Action Buttons */}
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {STATUS_TRANSITIONS[res.status as ReservationStatus]?.map((action) => (
                      <Button
                        key={action.next}
                        variant={action.variant}
                        size="sm"
                        loading={updateStatusMutation.isPending}
                        onClick={() =>
                          updateStatusMutation.mutate({
                            id: res.id,
                            status: action.next,
                          })
                        }
                      >
                        <action.icon className="w-4 h-4" />
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
