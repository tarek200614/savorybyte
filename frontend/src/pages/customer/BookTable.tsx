import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/services/api';
import { RestaurantTable, Reservation } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CardSkeleton } from '@/components/feedback/Skeleton';
import { Calendar, Users, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

const bookSchema = z.object({
  table_id: z.string().uuid('Please select a table'),
  reservation_date: z.string().min(1, 'Please select a date'),
  start_time: z.string().min(1, 'Please select start time'),
  end_time: z.string().min(1, 'Please select end time'),
  party_size: z.coerce.number().min(1, 'Party size must be at least 1'),
  special_requests: z.string().optional(),
});

type BookFormValues = z.infer<typeof bookSchema>;

export function BookTable() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<boolean>(false);

  // Fetch available tables
  const { data: tables, isLoading: loadingTables } = useQuery<RestaurantTable[]>({
    queryKey: ['tables'],
    queryFn: () => apiRequest<RestaurantTable[]>('/tables'),
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BookFormValues>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      party_size: 2,
      reservation_date: new Date().toISOString().split('T')[0],
      start_time: '19:00',
      end_time: '20:30',
    },
  });

  const selectedTableId = watch('table_id');

  const onSubmit = async (data: BookFormValues) => {
    setErrorMessage(null);
    setSuccessMessage(false);

    try {
      await apiRequest<Reservation>('/reservations', {
        method: 'POST',
        body: JSON.stringify({
          table_id: data.table_id,
          reservation_date: data.reservation_date,
          start_time: `${data.start_time}:00`,
          end_time: `${data.end_time}:00`,
          party_size: data.party_size,
          special_requests: data.special_requests || null,
        }),
      });

      setSuccessMessage(true);
      setTimeout(() => navigate('/my-reservations'), 1500);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Failed to complete reservation');
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm font-medium">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Luxury Dining Reservation System</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-100 tracking-tight">
          Reserve Your Table
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto font-light text-sm">
          Select your preferred table location, party size, and dining time slot.
        </p>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center space-x-3 max-w-lg mx-auto animate-fade-in">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
          <div>
            <p className="font-bold text-sm">Reservation Confirmed!</p>
            <p className="text-xs text-emerald-400/80">Redirecting to your bookings page...</p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center space-x-3 max-w-lg mx-auto">
          <AlertCircle className="w-6 h-6 text-rose-400 flex-shrink-0" />
          <div>
            <p className="font-bold text-sm">Booking Error</p>
            <p className="text-xs text-rose-400/90">{errorMessage}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Step 1: Interactive Table Grid Selection */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-200 flex items-center space-x-2">
            <Users className="w-5 h-5 text-amber-400" />
            <span>1. Select Dining Table</span>
          </h2>

          {loadingTables ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {tables?.map((table) => {
                const isSelected = selectedTableId === table.id;
                return (
                  <div
                    key={table.id}
                    onClick={() => setValue('table_id', table.id)}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 ring-2 ring-amber-500/40 shadow-lg shadow-amber-500/10'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-lg text-slate-100">
                        {table.table_number}
                      </span>
                      <Badge variant="amber">{table.location.replace('_', ' ')}</Badge>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-slate-400 font-mono">
                      <span>Max Capacity:</span>
                      <span className="text-amber-300 font-bold">{table.capacity} Seats</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {errors.table_id && (
            <p className="text-xs text-rose-400 font-medium">{errors.table_id.message}</p>
          )}
        </div>

        {/* Step 2: Date, Time & Party Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              <span>2. Reservation Details</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Reservation Date"
                type="date"
                min={new Date().toISOString().split('T')[0]}
                error={errors.reservation_date?.message}
                {...register('reservation_date')}
              />

              <Input
                label="Party Size (Guests)"
                type="number"
                min={1}
                max={20}
                error={errors.party_size?.message}
                {...register('party_size')}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Start Time"
                type="time"
                error={errors.start_time?.message}
                {...register('start_time')}
              />

              <Input
                label="End Time"
                type="time"
                error={errors.end_time?.message}
                {...register('end_time')}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Special Requests / Dietary Notes (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Anniversary celebration, high chair needed, window preference..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/30 transition"
                {...register('special_requests')}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full font-bold py-3 text-base"
              loading={isSubmitting}
            >
              Confirm Reservation
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
