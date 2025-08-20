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
  type: yup
    .string()
    .oneOf([
      'inmuebles',
      'vehiculos',
      'maquinaria',
      'tecnologia',
      'arte',
      'general',
    ])
    .required('Tipo requerido'),
  location: yup.string(),
  startingPrice: yup
    .number()
    .positive('Debe ser un valor positivo')
    .required('Precio inicial requerido'),
  endDate: yup.string().required('Fecha de finalización requerida'),
  status: yup.string().oneOf(['DRAFT', 'PUBLISHED']).default('DRAFT'),
  mainImageUrl: yup.string().url('Debe ser una URL válida').nullable(),
  secondaryImage1: yup.string().url('Debe ser una URL válida').nullable(),
  secondaryImage2: yup.string().url('Debe ser una URL válida').nullable(),
  secondaryImage3: yup.string().url('Debe ser una URL válida').nullable(),
  secondaryImage4: yup.string().url('Debe ser una URL válida').nullable(),
  secondaryImage5: yup.string().url('Debe ser una URL válida').nullable(),
  pdfUrl: yup.string().url('Debe ser una URL válida').nullable(),
  youtubeUrl: yup.string().url('Debe ser una URL válida').nullable(),
  isFeatured: yup.boolean().default(false),
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
        type: auction.type || 'general',
        location: auction.location || '',
        startingPrice: Number(auction.startingPrice),
        endDate: new Date(auction.endDate).toISOString().split('T')[0],
        status: auction.status,
        mainImageUrl: auction.mainImageUrl || '',
        secondaryImage1: auction.secondaryImage1 || '',
        secondaryImage2: auction.secondaryImage2 || '',
        secondaryImage3: auction.secondaryImage3 || '',
        secondaryImage4: auction.secondaryImage4 || '',
        secondaryImage5: auction.secondaryImage5 || '',
        pdfUrl: auction.pdfUrl || '',
        youtubeUrl: auction.youtubeUrl || '',
        isFeatured: auction.isFeatured || false,
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

            <div className="space-y-2">
              <Label htmlFor="type">Tipo de subasta</Label>
              <select
                id="type"
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                {...register('type')}
                disabled={loading}
              >
                <option value="general">General</option>
                <option value="inmuebles">Inmuebles</option>
                <option value="vehiculos">Vehículos</option>
                <option value="maquinaria">Maquinaria</option>
                <option value="tecnologia">Tecnología</option>
                <option value="arte">Arte</option>
              </select>
              {errors.type && (
                <p className="text-sm text-destructive">
                  {errors.type.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mainImageUrl">URL de imagen principal</Label>
              <Input
                id="mainImageUrl"
                type="url"
                placeholder="https://ejemplo.com/imagen.jpg"
                {...register('mainImageUrl')}
                disabled={loading}
              />
              {errors.mainImageUrl && (
                <p className="text-sm text-destructive">
                  {errors.mainImageUrl.message}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <Label>Imágenes secundarias (hasta 5)</Label>

              <div className="space-y-2">
                <Label htmlFor="secondaryImage1">Imagen secundaria 1</Label>
                <Input
                  id="secondaryImage1"
                  type="url"
                  placeholder="https://ejemplo.com/imagen2.jpg"
                  {...register('secondaryImage1')}
                  disabled={loading}
                />
                {errors.secondaryImage1 && (
                  <p className="text-sm text-destructive">
                    {errors.secondaryImage1.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondaryImage2">Imagen secundaria 2</Label>
                <Input
                  id="secondaryImage2"
                  type="url"
                  placeholder="https://ejemplo.com/imagen3.jpg"
                  {...register('secondaryImage2')}
                  disabled={loading}
                />
                {errors.secondaryImage2 && (
                  <p className="text-sm text-destructive">
                    {errors.secondaryImage2.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondaryImage3">Imagen secundaria 3</Label>
                <Input
                  id="secondaryImage3"
                  type="url"
                  placeholder="https://ejemplo.com/imagen4.jpg"
                  {...register('secondaryImage3')}
                  disabled={loading}
                />
                {errors.secondaryImage3 && (
                  <p className="text-sm text-destructive">
                    {errors.secondaryImage3.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondaryImage4">Imagen secundaria 4</Label>
                <Input
                  id="secondaryImage4"
                  type="url"
                  placeholder="https://ejemplo.com/imagen5.jpg"
                  {...register('secondaryImage4')}
                  disabled={loading}
                />
                {errors.secondaryImage4 && (
                  <p className="text-sm text-destructive">
                    {errors.secondaryImage4.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondaryImage5">Imagen secundaria 5</Label>
                <Input
                  id="secondaryImage5"
                  type="url"
                  placeholder="https://ejemplo.com/imagen6.jpg"
                  {...register('secondaryImage5')}
                  disabled={loading}
                />
                {errors.secondaryImage5 && (
                  <p className="text-sm text-destructive">
                    {errors.secondaryImage5.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pdfUrl">URL del PDF descargable</Label>
              <Input
                id="pdfUrl"
                type="url"
                placeholder="https://ejemplo.com/documento.pdf"
                {...register('pdfUrl')}
                disabled={loading}
              />
              {errors.pdfUrl && (
                <p className="text-sm text-destructive">
                  {errors.pdfUrl.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="youtubeUrl">URL de video de YouTube</Label>
              <Input
                id="youtubeUrl"
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                {...register('youtubeUrl')}
                disabled={loading}
              />
              {errors.youtubeUrl && (
                <p className="text-sm text-destructive">
                  {errors.youtubeUrl.message}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isFeatured"
                className="h-4 w-4 rounded border-gray-300"
                {...register('isFeatured')}
                disabled={loading}
              />
              <Label htmlFor="isFeatured" className="text-sm font-normal">
                Marcar como destacada (aparecerá en la página de inicio)
              </Label>
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
