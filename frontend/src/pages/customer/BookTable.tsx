import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/services/api';
import { RestaurantTable, Reservation, TableLocation } from '@/types';
import { useTranslation } from '@/i18n/LanguageContext';
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
  Users,
  Check,
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

export function BookTable() {
  const navigate = useNavigate();
  const { t, resolveLocation } = useTranslation();
  const [selectedZone, setSelectedZone] = useState<TableLocation | 'ALL'>('ALL');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<boolean>(false);

  const zoneFilterOptions: { value: TableLocation | 'ALL'; label: string }[] = [
    { value: 'ALL', label: t.reservations.allAreas },
    { value: 'MAIN_HALL', label: resolveLocation('MAIN_HALL').name },
    { value: 'TERRACE', label: resolveLocation('TERRACE').name },
    { value: 'PRIVATE_ROOM', label: resolveLocation('PRIVATE_ROOM').name },
    { value: 'BAR', label: resolveLocation('BAR').name },
  ];

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
        (err as Error).message || t.reservations.conflictError
      );
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 rtl:space-x-reverse px-3 py-1 rounded-full bg-charcoal border border-champagne/20 text-champagne text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-champagne" />
          <span>{t.reservations.badge}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-ivory tracking-tight">
          {t.reservations.title}
        </h1>
        <p className="text-stone-300 max-w-xl mx-auto font-light text-sm leading-relaxed">
          {t.reservations.desc}
        </p>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-charcoal border border-champagne/40 text-champagne flex items-center space-x-3 rtl:space-x-reverse max-w-lg mx-auto animate-fade-in shadow-xl">
          <CheckCircle2 className="w-6 h-6 text-champagne flex-shrink-0" />
          <div>
            <p className="font-bold text-sm text-ivory">{t.reservations.successTitle}</p>
            <p className="text-xs text-stone-300">{t.reservations.successDesc}</p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-midnight border border-terracotta/40 text-terracotta-light flex items-center space-x-3 rtl:space-x-reverse max-w-lg mx-auto shadow-xl">
          <AlertCircle className="w-6 h-6 text-terracotta flex-shrink-0" />
          <div>
            <p className="font-bold text-sm text-ivory">{t.reservations.noticeTitle}</p>
            <p className="text-xs text-stone-300">{errorMessage}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Step 1: Interactive Table Floor Plan Selection */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-serif font-bold text-ivory flex items-center space-x-2 rtl:space-x-reverse">
                <MapPin className="w-5 h-5 text-champagne" />
                <span>{t.reservations.step1Title}</span>
              </h2>
              <p className="text-xs text-stone-400 font-light mt-0.5">
                {t.reservations.step1Desc}
              </p>
            </div>

            {/* Zone Filter Tabs */}
            <div className="flex items-center space-x-2 rtl:space-x-reverse overflow-x-auto pb-1 scrollbar-none text-xs">
              {zoneFilterOptions.map((zone) => (
                <button
                  type="button"
                  key={zone.value}
                  onClick={() => setSelectedZone(zone.value)}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition whitespace-nowrap ${
                    selectedZone === zone.value
                      ? 'bg-saffron text-white shadow-md shadow-saffron/20 border border-saffron'
                      : 'bg-charcoal border border-champagne/15 text-stone-300 hover:text-ivory hover:bg-white/5'
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
            <div className="text-center py-8 text-stone-500">
              {t.common.error}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {filteredTables.map((table) => {
                const isSelected = selectedTableId === table.id;
                const zoneInfo = resolveLocation(table.location);
                return (
                  <div
                    key={table.id}
                    onClick={() => setValue('table_id', table.id)}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                      isSelected
                        ? 'bg-charcoal border-saffron ring-2 ring-saffron/40 shadow-lg shadow-saffron/20 transform -translate-y-0.5'
                        : 'bg-charcoal border-champagne/15 hover:border-champagne/40 hover:bg-charcoal/80'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-base text-ivory font-mono">
                          {t.common.table} {table.table_number}
                        </span>
                        <Badge
                          variant={isSelected ? 'saffron' : 'champagne'}
                          className="text-[10px]"
                        >
                          {zoneInfo.name}
                        </Badge>
                      </div>

                      <p className="text-[11px] text-stone-400 mt-2 line-clamp-2 leading-relaxed font-light">
                        {zoneInfo.subtitle}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-champagne/15 space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-stone-400 flex items-center space-x-1 rtl:space-x-reverse">
                          <Users className="w-3.5 h-3.5 text-champagne" />
                          <span>{t.bookings.partySize}</span>
                        </span>
                        <span className="text-champagne font-bold">
                          {t.reservations.capacity.replace('{count}', String(table.capacity))}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-stone-400">{t.common.status}:</span>
                        <span className={`font-semibold flex items-center space-x-1 rtl:space-x-reverse ${isSelected ? 'text-saffron' : 'text-botanical-light'}`}>
                          {isSelected ? (
                            <>
                              <Check className="w-3 h-3 text-saffron" />
                              <span>{t.common.selected}</span>
                            </>
                          ) : (
                            <span>{t.common.available}</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {errors.table_id && (
            <p className="text-xs text-terracotta font-medium">{errors.table_id.message}</p>
          )}

          {selectedTable && (
            <div className="p-3.5 rounded-xl bg-charcoal border border-champagne/30 text-champagne text-xs flex items-center space-x-2 rtl:space-x-reverse">
              <CheckCircle2 className="w-4 h-4 text-champagne flex-shrink-0" />
              <span className="text-ivory">
                {t.reservations.selectedNotice
                  .replace('{name}', `${t.common.table} ${selectedTable.table_number}`)
                  .replace('{location}', resolveLocation(selectedTable.location).name)
                  .replace('{capacity}', String(selectedTable.capacity))}
              </span>
            </div>
          )}
        </div>

        {/* Step 2: Date, Time & Reservation Details */}
        <Card className="border-champagne/20 bg-charcoal/95 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-serif font-bold flex items-center space-x-2 rtl:space-x-reverse text-ivory">
              <Calendar className="w-5 h-5 text-champagne" />
              <span>{t.reservations.step2Title}</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={t.reservations.dateLabel}
                type="date"
                min={new Date().toISOString().split('T')[0]}
                error={errors.reservation_date?.message}
                {...register('reservation_date')}
              />

              <Input
                label={t.reservations.partySizeLabel}
                type="number"
                min={1}
                max={20}
                error={errors.party_size?.message}
                {...register('party_size')}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={t.reservations.startTimeLabel}
                type="time"
                error={errors.start_time?.message}
                {...register('start_time')}
              />

              <Input
                label={t.reservations.endTimeLabel}
                type="time"
                error={errors.end_time?.message}
                {...register('end_time')}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider">
                {t.reservations.notesLabel}
              </label>
              <textarea
                rows={3}
                placeholder={t.reservations.notesPlaceholder}
                className="w-full px-4 py-2.5 rounded-xl bg-midnight border border-champagne/20 text-ivory placeholder-stone-500 text-sm focus:outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/30 transition"
                {...register('special_requests')}
              />
            </div>

            <div className="p-4 rounded-xl bg-midnight border border-champagne/20 text-xs text-stone-300 space-y-1.5 font-light">
              <div className="flex items-center space-x-2 rtl:space-x-reverse text-champagne font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>{t.common.halalCertified} • {t.common.alcoholFreePorkFree}</span>
              </div>
              <p>
                {t.home.heroSubtitle}
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full font-semibold py-3.5 text-base shadow-xl shadow-saffron/20"
              loading={isSubmitting}
            >
              {t.reservations.confirmBtn}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
