import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/services/api';
import { RestaurantTable, TableLocation } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/feedback/EmptyState';
import { CardSkeleton } from '@/components/feedback/Skeleton';
import { UtensilsCrossed, Plus, Trash2 } from 'lucide-react';

const tableSchema = z.object({
  table_number: z.string().min(1, 'Table number is required'),
  capacity: z.coerce.number().min(1, 'Minimum 1 seat').max(50, 'Maximum 50 seats'),
  location: z.enum(['MAIN_HALL', 'TERRACE', 'PRIVATE_ROOM', 'BAR'] as const),
});

type TableFormValues = z.infer<typeof tableSchema>;

const LOCATION_OPTIONS: { value: TableLocation; label: string }[] = [
  { value: 'MAIN_HALL', label: 'Main Hall' },
  { value: 'TERRACE', label: 'Terrace' },
  { value: 'PRIVATE_ROOM', label: 'Private Room' },
  { value: 'BAR', label: 'Bar' },
];

export function ManageTables() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);

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
          <h1 className="text-3xl font-extrabold text-slate-100 flex items-center space-x-3">
            <UtensilsCrossed className="w-8 h-8 text-amber-400" />
            <span>Table Management</span>
          </h1>
          <p className="text-sm text-slate-400 font-light mt-1">
            Add, configure, and manage restaurant dining tables
          </p>
        </div>

        <Button variant="primary" onClick={openCreate}>
          <Plus className="w-4 h-4" /> Add Table
        </Button>
      </div>

      {/* Tables Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : !tables || tables.length === 0 ? (
        <EmptyState
          title="No Tables Configured"
          description="Add your first dining table to start accepting reservations."
          action={
            <Button variant="primary" onClick={openCreate}>
              <Plus className="w-4 h-4" /> Add First Table
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {tables.map((table) => (
            <Card key={table.id}>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg text-slate-100">
                    {table.table_number}
                  </span>
                  <Badge variant="amber">
                    {table.location.replace('_', ' ')}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>Capacity:</span>
                  <span className="text-amber-300 font-bold">{table.capacity} Seats</span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>Status:</span>
                  <Badge variant={table.is_active ? 'emerald' : 'rose'}>
                    {table.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div className="flex items-center space-x-2 pt-2 border-t border-slate-800/80">
                  <Button
                    variant="danger"
                    size="sm"
                    className="flex-1"
                    loading={deleteMutation.isPending}
                    onClick={() => {
                      if (window.confirm(`Delete table ${table.table_number}?`)) {
                        deleteMutation.mutate(table.id);
                      }
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Table Modal */}
      <Modal isOpen={showModal} onClose={closeModal} title="Add New Table">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Table Number / Name"
            placeholder="T-01, VIP-1, etc."
            error={errors.table_number?.message}
            {...register('table_number')}
          />

          <Input
            label="Seating Capacity"
            type="number"
            min={1}
            max={50}
            error={errors.capacity?.message}
            {...register('capacity')}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Location
            </label>
            <select
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/30 transition"
              {...register('location')}
            >
              {LOCATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.location && (
              <p className="text-xs text-rose-400">{errors.location.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={closeModal}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              loading={isSubmitting || createMutation.isPending}
            >
              Create Table
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
