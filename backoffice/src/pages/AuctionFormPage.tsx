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
import FileUpload from '../components/FileUpload';
import { RichTextEditor } from '../components/RichTextEditor';

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
  currency: yup.string().oneOf(['ARS', 'USD']).default('ARS'),
  startingPrice: yup
    .number()
    .positive('Debe ser un valor positivo')
    .required('Precio inicial requerido'),
  endDate: yup.string().required('Fecha de finalización requerida'),
  status: yup.string().oneOf(['DRAFT', 'PUBLISHED']).default('DRAFT'),
  mainImageFile: yup.mixed().nullable(), // Archivo de imagen principal
  secondaryImages: yup.mixed().nullable(), // Archivos de imágenes secundarias
  pdfFile: yup.mixed().nullable(), // Archivo PDF
  youtubeUrl: yup.string().url('Debe ser una URL válida').nullable(),
  auctionLink: yup.string().url('Debe ser una URL válida').nullable(),
  details: yup.string().nullable(),
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
    setValue,
    watch,
    formState: { errors },
  } = useForm<any>({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (auction) {
      reset({
        title: auction.title,
        description: auction.description,
        type: auction.type || 'general',
        location: auction.location || '',
        currency: auction.currency || 'ARS',
        startingPrice: Number(auction.startingPrice),
        endDate: (() => {
          const date = new Date(auction.endDate);
          // Ajustar para timezone local
          const offset = date.getTimezoneOffset();
          const localDate = new Date(date.getTime() - offset * 60 * 1000);
          return localDate.toISOString().split('T')[0];
        })(),
        status: auction.status,
        youtubeUrl: auction.youtubeUrl || '',
        auctionLink: auction.auctionLink || '',
        details: auction.details || '',
        isFeatured: auction.isFeatured || false,
        mainImageFile: null,
        secondaryImages: null,
        pdfFile: null,
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

  const onSubmit = (data: any) => {
    // Crear FormData para enviar archivos
    const formData = new FormData();

    // Agregar todos los campos del formulario (excepto archivos)
    Object.keys(data).forEach((key) => {
      if (
        !['mainImageFile', 'secondaryImages', 'pdfFile'].includes(key) &&
        data[key] !== null &&
        data[key] !== ''
      ) {
        formData.append(key, String(data[key]));
      }
    });

    // Agregar imagen principal
    if (data.mainImageFile && data.mainImageFile.length > 0) {
      formData.append('files', data.mainImageFile[0]);
    }

    // Agregar imágenes secundarias
    if (data.secondaryImages && data.secondaryImages.length > 0) {
      Array.from(data.secondaryImages).forEach((file: any) => {
        formData.append('files', file);
      });
    }

    // Agregar PDF
    if (data.pdfFile && data.pdfFile.length > 0) {
      formData.append('files', data.pdfFile[0]);
    }

    if (isEdit) {
      updateMutation.mutate(formData as any);
    } else {
      createMutation.mutate(formData as any);
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
                  {String(errors.title.message)}
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
                  {String(errors.description.message)}
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
                  {String(errors.type.message)}
                </p>
              )}
            </div>

            <FileUpload
              label="Imagen principal"
              accept="image/*"
              multiple={false}
              maxFiles={1}
              onFilesChange={(files) => setValue('mainImageFile', files)}
              disabled={loading}
              description="Sube la imagen principal de la subasta (JPG, PNG, GIF, WebP)"
              showPreview={true}
            />
            {errors.mainImageFile && (
              <p className="text-sm text-destructive">
                {String(errors.mainImageFile.message)}
              </p>
            )}

            <FileUpload
              label="Imágenes secundarias (hasta 5)"
              accept="image/*"
              multiple={true}
              maxFiles={5}
              onFilesChange={(files) => setValue('secondaryImages', files)}
              disabled={loading}
              description="Sube hasta 5 imágenes adicionales de la subasta"
              showPreview={true}
            />
            {errors.secondaryImages && (
              <p className="text-sm text-destructive">
                {String(errors.secondaryImages.message)}
              </p>
            )}

            <FileUpload
              label="PDF descargable"
              accept="application/pdf"
              multiple={false}
              maxFiles={1}
              onFilesChange={(files) => setValue('pdfFile', files)}
              disabled={loading}
              description="Sube un archivo PDF con información adicional de la subasta"
              showPreview={true}
            />
            {errors.pdfFile && (
              <p className="text-sm text-destructive">
                {String(errors.pdfFile.message)}
              </p>
            )}

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
                  {String(errors.youtubeUrl.message)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="auctionLink">Enlace a la subasta oficial</Label>
              <Input
                id="auctionLink"
                type="url"
                placeholder="https://www.remate.com.ar/subasta/..."
                {...register('auctionLink')}
                disabled={loading}
              />
              {errors.auctionLink && (
                <p className="text-sm text-destructive">
                  {String(errors.auctionLink.message)}
                </p>
              )}
            </div>

            <RichTextEditor
              label="Detalles Técnicos"
              value={watch('details') || ''}
              onChange={(value) => setValue('details', value)}
              placeholder="Escribe los detalles técnicos usando el editor. Puedes usar negritas, cursivas, listas, colores, etc."
              disabled={loading}
              error={errors.details ? String(errors.details.message) : undefined}
              description="Usa las herramientas del editor para dar formato al texto. Los detalles aparecerán en la pestaña 'Detalles Técnicos' del frontend."
            />

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

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="currency">Moneda</Label>
                <select
                  id="currency"
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                  {...register('currency')}
                  disabled={loading}
                >
                  <option value="ARS">Pesos Argentinos (ARS)</option>
                  <option value="USD">Dólares Americanos (USD)</option>
                </select>
                {errors.currency && (
                  <p className="text-sm text-destructive">
                    {String(errors.currency.message)}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="startingPrice">Precio inicial</Label>
                <Input
                  id="startingPrice"
                  type="number"
                  {...register('startingPrice', { valueAsNumber: true })}
                  disabled={loading}
                />
                {errors.startingPrice && (
                  <p className="text-sm text-destructive">
                    {String(errors.startingPrice.message)}
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
                    {String(errors.endDate.message)}
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
