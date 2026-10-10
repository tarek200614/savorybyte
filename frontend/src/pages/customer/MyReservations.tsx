import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/services/api';
import { Reservation } from '@/types';
import { useTranslation } from '@/i18n/LanguageContext';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { CardSkeleton } from '@/components/feedback/Skeleton';
import { Calendar, Clock, Users, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function MyReservations() {
  const { t, resolveReservationStatus } = useTranslation();
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
    const label = resolveReservationStatus(status);
    switch (status) {
      case 'CONFIRMED':
        return <Badge variant="botanical">{label}</Badge>;
      case 'PENDING':
        return <Badge variant="champagne">{label}</Badge>;
      case 'SEATED':
        return <Badge variant="saffron">{label}</Badge>;
      case 'COMPLETED':
        return <Badge variant="neutral">{label}</Badge>;
      case 'CANCELLED':
        return <Badge variant="terracotta">{label}</Badge>;
      default:
        return <Badge variant="neutral">{label}</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif font-bold text-ivory flex items-center space-x-3 rtl:space-x-reverse">
          <Calendar className="w-8 h-8 text-champagne" />
          <span>{t.bookings.title}</span>
        </h1>
        <Link to="/reservations/book">
          <Button variant="primary" size="sm" className="font-semibold shadow-md shadow-saffron/20">
            {t.bookings.bookTableBtn}
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : !reservations || reservations.length === 0 ? (
        <EmptyState
          title={t.bookings.noBookingsTitle}
          description={t.bookings.noBookingsDesc}
        />
      ) : (
        <div className="space-y-4">
          {reservations.map((res) => (
            <Card key={res.id} className="border-champagne/15 bg-charcoal shadow-xl">
              <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <span className="font-serif font-bold text-lg text-ivory">
                      {t.common.table} {res.table?.table_number || 'N/A'}
                    </span>
                    {getStatusBadge(res.status)}
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs text-stone-400 font-mono">
                    <span className="flex items-center space-x-1 rtl:space-x-reverse">
                      <Calendar className="w-3.5 h-3.5 text-champagne" />
                      <span>{res.reservation_date}</span>
                    </span>
                    <span className="flex items-center space-x-1 rtl:space-x-reverse">
                      <Clock className="w-3.5 h-3.5 text-champagne" />
                      <span dir="ltr">
                        {res.start_time} - {res.end_time}
                      </span>
                    </span>
                    <span className="flex items-center space-x-1 rtl:space-x-reverse">
                      <Users className="w-3.5 h-3.5 text-champagne" />
                      <span>{res.party_size} {t.common.guests}</span>
                    </span>
                  </div>

                  {res.special_requests && (
                    <p className="text-xs text-stone-300 italic pt-1">
                      "{res.special_requests}"
                    </p>
                  )}
                </div>

                {res.status === 'CONFIRMED' || res.status === 'PENDING' ? (
                  <Button
                    variant="danger"
                    size="sm"
                    loading={cancelMutation.isPending}
                    onClick={() => cancelMutation.mutate(res.id)}
                    className="self-start sm:self-center font-medium"
                  >
                    <XCircle className="w-4 h-4 mr-1.5 rtl:mr-0 rtl:ml-1.5" />
                    {t.bookings.cancelBtn}
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
