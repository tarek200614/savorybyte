import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/services/api';
import { RestaurantTable, Reservation, TableLocation } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CardSkeleton } from '@/components/feedback/Skeleton';
import {
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  MapPin,
} from 'lucide-react';

const bookSchema = z.object({
  table_id: z.string().uuid('Please select a dining table'),
  reservation_date: z.string().min(1, 'Please select a date'),
  start_time: z.string().min(1, 'Please select start time'),
  end_time: z.string().min(1, 'Please select end time'),
  party_size: z.coerce.number().min(1, 'Party size must be at least 1 guest'),
  special_requests: z.string().optional(),
});

type BookFormValues = z.infer<typeof bookSchema>;

const ZONE_FILTERS: { value: TableLocation | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All Zones' },
  { value: 'MAIN_HALL', label: 'Main Dining Hall' },
  { value: 'TERRACE', label: 'Garden Terrace' },
  { value: 'PRIVATE_ROOM', label: 'Executive Majlis' },
  { value: 'BAR', label: 'Mocktail Lounge' },
];

export function BookTable() {
  const navigate = useNavigate();
  const [selectedZone, setSelectedZone] = useState<TableLocation | 'ALL'>('ALL');
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
  const selectedTable = tables?.find((t) => t.id === selectedTableId);

  const filteredTables = tables?.filter(
    (t) => selectedZone === 'ALL' || t.location === selectedZone
  );

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
      setTimeout(() => navigate('/my-reservations'), 1800);
    } catch (err: unknown) {
      setErrorMessage(
        (err as Error).message ||
          'The selected table is currently unavailable for this time slot. Please choose another table or time.'
      );
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Instant Table Allocation with Collision Prevention</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-100 tracking-tight">
          Reserve Your Dining Experience
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto font-light text-sm">
          Select your preferred ambiance zone, dining table, and dining time slot. All meals are prepared strictly adhering to 100% Halal culinary standards.
        </p>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center space-x-3 max-w-lg mx-auto animate-fade-in shadow-xl shadow-emerald-500/5">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
          <div>
            <p className="font-bold text-sm">Table Successfully Reserved!</p>
            <p className="text-xs text-emerald-400/80">Redirecting to your reservation pass...</p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center space-x-3 max-w-lg mx-auto shadow-xl shadow-rose-500/5">
          <AlertCircle className="w-6 h-6 text-rose-400 flex-shrink-0" />
          <div>
            <p className="font-bold text-sm">Booking Notice</p>
            <p className="text-xs text-rose-400/90">{errorMessage}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Step 1: Interactive Table Floor Plan Selection */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-slate-200 flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-amber-400" />
              <span>1. Select Dining Zone & Table</span>
            </h2>

            {/* Zone Filter Tabs */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none text-xs">
              {ZONE_FILTERS.map((zone) => (
                <button
                  type="button"
                  key={zone.value}
                  onClick={() => setSelectedZone(zone.value)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                    selectedZone === zone.value
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {zone.label}
                </button>
              ))}
            </div>
          </div>

          {loadingTables ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : !filteredTables || filteredTables.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No tables found in this zone. Please select another zone.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {filteredTables.map((table) => {
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
                      <span className="font-bold text-base text-slate-100 font-mono">
                        Table {table.table_number}
                      </span>
                      <Badge variant="amber" className="text-[10px]">
                        {table.location.replace('_', ' ')}
                      </Badge>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs text-slate-400 font-mono">
                      <span>Max Capacity:</span>
                      <span className="text-amber-300 font-bold">{table.capacity} Guests</span>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Status:</span>
                      <span className="text-emerald-400 font-semibold">Available</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {errors.table_id && (
            <p className="text-xs text-rose-400 font-medium">{errors.table_id.message}</p>
          )}

          {selectedTable && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>
                Selected: <strong>Table {selectedTable.table_number}</strong> ({selectedTable.location.replace('_', ' ')}) with seating for up to <strong>{selectedTable.capacity} guests</strong>.
              </span>
            </div>
          )}
        </div>

        {/* Step 2: Date, Time & Reservation Details */}
        <Card className="border-slate-800 bg-slate-900/90 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              <span>2. Reservation Date & Time Details</span>
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
                label="Party Size (Number of Guests)"
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
                Special Requests / Halal Dining Preferences (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Anniversary celebration, baby high-chair needed, prayer space inquiry, quiet corner preference..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/30 transition"
                {...register('special_requests')}
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 space-y-1.5 font-light">
              <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>SavoryByte Dining Guarantee</span>
              </div>
              <p>
                Your table is reserved exclusively for your selected time slot with automated collision checks. Cancellation is available free of charge through your Customer Portal.
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full font-bold py-3.5 text-base shadow-xl shadow-amber-500/20"
              loading={isSubmitting}
            >
              Confirm & Lock Reservation
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
