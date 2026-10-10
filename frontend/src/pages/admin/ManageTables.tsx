import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/services/api';
import { RestaurantTable, TableLocation } from '@/types';
import { useTranslation } from '@/i18n/LanguageContext';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/feedback/EmptyState';
import { CardSkeleton } from '@/components/feedback/Skeleton';
import { UtensilsCrossed, Plus, Trash2, Users } from 'lucide-react';

const tableSchema = z.object({
  table_number: z.string().min(1, 'Table number is required'),
  capacity: z.coerce.number().min(1, 'Minimum 1 seat').max(50, 'Maximum 50 seats'),
  location: z.enum(['MAIN_HALL', 'TERRACE', 'PRIVATE_ROOM', 'BAR'] as const),
});

type TableFormValues = z.infer<typeof tableSchema>;

export function ManageTables() {
  const { t, resolveLocation } = useTranslation();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);

  const locationOptions: { value: TableLocation; label: string }[] = [
    { value: 'MAIN_HALL', label: resolveLocation('MAIN_HALL').name },
    { value: 'TERRACE', label: resolveLocation('TERRACE').name },
    { value: 'PRIVATE_ROOM', label: resolveLocation('PRIVATE_ROOM').name },
    { value: 'BAR', label: resolveLocation('BAR').name },
  ];

  const { data: tables, isLoading } = useQuery<RestaurantTable[]>({
    queryKey: ['admin-tables'],
    queryFn: () => apiRequest<RestaurantTable[]>('/tables'),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TableFormValues>({
    resolver: zodResolver(tableSchema),
  });

  const createMutation = useMutation({
    mutationFn: (data: TableFormValues) =>
      apiRequest<RestaurantTable>('/tables', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tables'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest<void>(`/tables/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tables'] });
    },
  });

  const openCreate = () => {
    reset({ table_number: '', capacity: 2, location: 'MAIN_HALL' });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    reset();
  };

  const onSubmit = (data: TableFormValues) => {
    createMutation.mutate(data);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-ivory flex items-center space-x-3 rtl:space-x-reverse">
            <UtensilsCrossed className="w-8 h-8 text-champagne" />
            <span>{t.admin.manageTables}</span>
          </h1>
          <p className="text-xs text-stone-400 mt-1 font-light">
            {t.home.diningSettingsDesc}
          </p>
        </div>

        <Button variant="primary" onClick={openCreate} className="shadow-md shadow-saffron/20">
          <Plus className="w-4 h-4 mr-1.5 rtl:mr-0 rtl:ml-1.5" /> {t.common.save}
        </Button>
      </div>

      {/* Tables Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : !tables || tables.length === 0 ? (
        <EmptyState
          title={t.admin.activeTables}
          description={t.common.error}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tables.map((table) => {
            const zoneInfo = resolveLocation(table.location);
            return (
              <Card
                key={table.id}
                className="border-champagne/15 bg-charcoal hover:border-champagne/40 transition shadow-xl"
              >
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-serif font-bold text-lg text-ivory">
                        {t.common.table} {table.table_number}
                      </h3>
                      <p className="text-xs text-stone-400 font-medium">
                        {zoneInfo.name}
                      </p>
                    </div>
                    <Badge variant={table.status === 'AVAILABLE' ? 'botanical' : 'champagne'}>
                      {table.status === 'AVAILABLE' ? t.common.available : table.status}
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs text-stone-300 font-mono">
                    <Users className="w-4 h-4 text-champagne" />
                    <span>{t.bookings.partySize}: <strong className="text-ivory">{table.capacity} {t.common.guests}</strong></span>
                  </div>

                  <div className="pt-3 border-t border-champagne/15 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      loading={deleteMutation.isPending}
                      onClick={() => {
                        if (confirm(`${t.admin.deleteDishConfirm} (${t.common.table} ${table.table_number})`)) {
                          deleteMutation.mutate(table.id);
                        }
                      }}
                      className="text-xs text-terracotta hover:text-terracotta-light hover:bg-terracotta/10"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1 rtl:mr-0 rtl:ml-1" />
                      {t.common.delete}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Table Modal */}
      <Modal isOpen={showModal} onClose={closeModal} title={t.admin.manageTables}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label={t.common.table}
            placeholder="e.g. T-04, TERR-03, MAJLIS-02"
            error={errors.table_number?.message}
            {...register('table_number')}
          />

          <Input
            label={t.bookings.partySize}
            type="number"
            min={1}
            max={50}
            error={errors.capacity?.message}
            {...register('capacity')}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider">
              {t.home.seatingOptionsPill}
            </label>
            <select
              className="w-full px-4 py-2.5 rounded-xl bg-midnight border border-champagne/20 text-ivory text-sm focus:outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/30 transition"
              {...register('location')}
            >
              {locationOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.location && (
              <p className="text-xs text-terracotta font-medium">{errors.location.message}</p>
            )}
          </div>

          <div className="flex items-center justify-end space-x-3 rtl:space-x-reverse pt-4 border-t border-champagne/15">
            <Button variant="ghost" type="button" onClick={closeModal}>
              {t.common.cancel}
            </Button>
            <Button variant="primary" type="submit" loading={isSubmitting}>
              {t.common.save}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
