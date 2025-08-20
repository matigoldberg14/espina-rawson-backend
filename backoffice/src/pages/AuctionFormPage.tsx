import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useQuery, useMutation } from '@tanstack/react-query';
import { auctionService } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

const schema = yup.object({
  title: yup.string().required('Título requerido'),
  description: yup.string().required('Descripción requerida'),
  location: yup.string(),
  startingPrice: yup
    .number()
    .positive('Debe ser un valor positivo')
    .required('Precio inicial requerido'),
  endDate: yup.string().required('Fecha de finalización requerida'),
  status: yup.string().oneOf(['DRAFT', 'PUBLISHED']).default('DRAFT'),
});

type FormData = yup.InferType<typeof schema>;

export default function AuctionFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const { data: auction } = useQuery({
    queryKey: ['auction', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await auctionService.getById(id);
      return response.data.data;
    },
    enabled: isEdit,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (auction) {
      reset({
        title: auction.title,
        description: auction.description,
        location: auction.location || '',
        startingPrice: Number(auction.startingPrice),
        endDate: new Date(auction.endDate).toISOString().split('T')[0],
        status: auction.status,
      });
    }
  }, [auction, reset]);

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return auctionService.create(data);
    },
    onSuccess: () => {
      toast.success('Subasta creada exitosamente');
      navigate('/auctions');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return auctionService.update(id!, data);
    },
    onSuccess: () => {
      toast.success('Subasta actualizada exitosamente');
      navigate('/auctions');
    },
  });

  const onSubmit = (data: FormData) => {
    if (isEdit) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const loading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/auctions')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">
          {isEdit ? 'Editar Subasta' : 'Nueva Subasta'}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información de la Subasta</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input id="title" {...register('title')} disabled={loading} />
              {errors.title && (
                <p className="text-sm text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <textarea
                id="description"
                className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                {...register('description')}
                disabled={loading}
              />
              {errors.description && (
                <p className="text-sm text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Ubicación</Label>
              <Input
                id="location"
                {...register('location')}
                disabled={loading}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startingPrice">Precio inicial (USD)</Label>
                <Input
                  id="startingPrice"
                  type="number"
                  {...register('startingPrice', { valueAsNumber: true })}
                  disabled={loading}
                />
                {errors.startingPrice && (
                  <p className="text-sm text-destructive">
                    {errors.startingPrice.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">Fecha de finalización</Label>
                <Input
                  id="endDate"
                  type="date"
                  {...register('endDate')}
                  disabled={loading}
                />
                {errors.endDate && (
                  <p className="text-sm text-destructive">
                    {errors.endDate.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <select
                id="status"
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                {...register('status')}
                disabled={loading}
              >
                <option value="DRAFT">Borrador</option>
                <option value="PUBLISHED">Publicado</option>
              </select>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/auctions')}
                disabled={loading}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
