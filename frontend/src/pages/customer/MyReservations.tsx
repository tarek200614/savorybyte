import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/services/api';
import { Reservation } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { CardSkeleton } from '@/components/feedback/Skeleton';
import { Calendar, Clock, Users, XCircle } from 'lucide-react';

export function MyReservations() {
  const queryClient = useQueryClient();

  const { data: reservations, isLoading } = useQuery<Reservation[]>({
    queryKey: ['my-reservations'],
    queryFn: () => apiRequest<Reservation[]>('/reservations/my-reservations'),
  });

  const cancelMutation = useMutation({
    mutationFn: (reservationId: string) =>
      apiRequest<Reservation>(`/reservations/${reservationId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'CANCELLED' }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-reservations'] });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <Badge variant="emerald">CONFIRMED</Badge>;
      case 'PENDING':
        return <Badge variant="amber">PENDING</Badge>;
      case 'SEATED':
        return <Badge variant="blue">SEATED</Badge>;
      case 'COMPLETED':
        return <Badge variant="purple">COMPLETED</Badge>;
      case 'CANCELLED':
        return <Badge variant="rose">CANCELLED</Badge>;
      default:
        return <Badge variant="slate">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-slate-100 flex items-center space-x-3">
          <Calendar className="w-8 h-8 text-amber-400" />
          <span>My Dining Bookings</span>
        </h1>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : !reservations || reservations.length === 0 ? (
        <EmptyState
          title="No Reservations Found"
          description="You haven't booked any dining tables yet."
        />
      ) : (
        <div className="space-y-4">
          {reservations.map((res) => (
            <Card key={res.id}>
              <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-lg text-slate-100">
                      Table {res.table?.table_number || 'N/A'}
                    </span>
                    {getStatusBadge(res.status)}
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs text-slate-400 font-mono">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      <span>{res.reservation_date}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>
                        {res.start_time} - {res.end_time}
                      </span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Users className="w-3.5 h-3.5 text-amber-400" />
                      <span>{res.party_size} Guests</span>
                    </span>
                  </div>

                  {res.special_requests && (
                    <p className="text-xs text-slate-400 italic pt-1">
                      "{res.special_requests}"
                    </p>
                  )}
                </div>

                {res.status === 'PENDING' || res.status === 'CONFIRMED' ? (
                  <Button
                    variant="danger"
                    size="sm"
                    loading={cancelMutation.isPending}
                    onClick={() => cancelMutation.mutate(res.id)}
                  >
                    <XCircle className="w-4 h-4" /> Cancel Booking
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
