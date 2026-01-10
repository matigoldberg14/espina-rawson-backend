import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { lotService, auctionService } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { FileUpload } from '../components/FileUpload';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, Trash2, X, Image, Video } from 'lucide-react';
import { RichTextEditor } from '../components/RichTextEditor';

const schema = yup.object({
  lotNumber: yup.number().required('El número de lote es obligatorio').min(1),
  title: yup.string().required('El título es obligatorio'),
  description: yup.string().nullable(),
  currency: yup.string().required(),
  startingPrice: yup.number().required('El precio base es obligatorio').min(0),
  currentPrice: yup.number().nullable(),
  details: yup.string().nullable(),
  videos: yup.array().of(yup.string()),
  images: yup.mixed().nullable(),
});

type FormData = yup.InferType<typeof schema>;

interface LotImage {
  id: string;
  url: string;
  isPrimary: boolean;
  order: number;
}

interface LotVideo {
  id: string;
  url: string;
  title?: string;
}

interface Lot {
  id: string;
  lotNumber: number;
  title: string;
  description?: string;
  currency: string;
  startingPrice: number;
  currentPrice?: number;
  details?: string;
  images: LotImage[];
  videos: LotVideo[];
}

export default function LotFormPage() {
  const { auctionId, lotId } = useParams<{ auctionId: string; lotId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!lotId;

  const [existingImages, setExistingImages] = useState<LotImage[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [videoUrls, setVideoUrls] = useState<string[]>(['']);

  // Obtener datos de la subasta
  const { data: auction } = useQuery({
    queryKey: ['auction', auctionId],
    queryFn: async () => {
      const response = await auctionService.getById(auctionId!);
      return response.data.data;
    },
    enabled: !!auctionId,
  });

  // Obtener datos del lote si estamos editando
  const { data: lot, isLoading: isLoadingLot } = useQuery({
    queryKey: ['lot', lotId],
    queryFn: async () => {
      const response = await lotService.getById(lotId!);
      return response.data.data as Lot;
    },
    enabled: !!lotId,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      lotNumber: 1,
      title: '',
      description: '',
      currency: 'ARS',
      startingPrice: 0,
      currentPrice: undefined,
      details: '',
      videos: [''],
    },
  });

  // Cargar datos del lote cuando se edita
  useEffect(() => {
    if (lot) {
      reset({
        lotNumber: lot.lotNumber,
        title: lot.title,
        description: lot.description || '',
        currency: lot.currency || 'ARS',
        startingPrice: lot.startingPrice,
        currentPrice: lot.currentPrice || undefined,
        details: lot.details || '',
      });
      setExistingImages(lot.images || []);
      setVideoUrls(lot.videos.length > 0 ? lot.videos.map(v => v.url) : ['']);
    }
  }, [lot, reset]);

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const formData = new FormData();
      formData.append('auctionId', auctionId!);
      formData.append('lotNumber', String(data.lotNumber));
      formData.append('title', data.title);
      if (data.description) formData.append('description', data.description);
      formData.append('currency', data.currency);
      formData.append('startingPrice', String(data.startingPrice));
      if (data.currentPrice) formData.append('currentPrice', String(data.currentPrice));
      if (data.details) formData.append('details', data.details);

      // Agregar videos
      const validVideos = videoUrls.filter(v => v && v.trim());
      validVideos.forEach(url => {
        formData.append('videos', url);
      });

      // Agregar imágenes nuevas
      newFiles.forEach(file => {
        formData.append('images', file);
      });

      return lotService.create(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lots', auctionId] });
      toast.success('Lote creado correctamente');
      navigate(`/auctions/${auctionId}/lots`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Error al crear el lote');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const formData = new FormData();
      formData.append('lotNumber', String(data.lotNumber));
      formData.append('title', data.title);
      if (data.description) formData.append('description', data.description);
      formData.append('currency', data.currency);
      formData.append('startingPrice', String(data.startingPrice));
      if (data.currentPrice) formData.append('currentPrice', String(data.currentPrice));
      if (data.details) formData.append('details', data.details);

      // Agregar videos
      const validVideos = videoUrls.filter(v => v && v.trim());
      validVideos.forEach(url => {
        formData.append('videos', url);
      });

      // IDs de imágenes existentes a mantener
      formData.append('existingImages', JSON.stringify(existingImages.map(img => img.id)));

      // Agregar imágenes nuevas
      newFiles.forEach(file => {
        formData.append('images', file);
      });

      return lotService.update(lotId!, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lots', auctionId] });
      queryClient.invalidateQueries({ queryKey: ['lot', lotId] });
      toast.success('Lote actualizado correctamente');
      navigate(`/auctions/${auctionId}/lots`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Error al actualizar el lote');
    },
  });

  const onSubmit = (data: FormData) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleFilesChange = (files: File[]) => {
    const totalImages = existingImages.length + newFiles.length + files.length;
    if (totalImages > 15) {
      toast.error('Máximo 15 imágenes por lote');
      return;
    }
    setNewFiles(prev => [...prev, ...files]);
  };

  const removeExistingImage = (imageId: string) => {
    setExistingImages(prev => prev.filter(img => img.id !== imageId));
  };

  const removeNewFile = (index: number) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addVideoField = () => {
    setVideoUrls(prev => [...prev, '']);
  };

  const removeVideoField = (index: number) => {
    setVideoUrls(prev => prev.filter((_, i) => i !== index));
  };

  const updateVideoUrl = (index: number, value: string) => {
    setVideoUrls(prev => {
      const newUrls = [...prev];
      newUrls[index] = value;
      return newUrls;
    });
  };

  if (isEditing && isLoadingLot) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const totalImages = existingImages.length + newFiles.length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/auctions/${auctionId}/lots`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Lotes
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold">
          {isEditing ? 'Editar Lote' : 'Nuevo Lote'}
        </h1>
        {auction && (
          <p className="text-muted-foreground">Subasta: {auction.title}</p>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Información básica */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Lote</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lotNumber">Número de Lote *</Label>
                <Input
                  id="lotNumber"
                  type="number"
                  min="1"
                  {...register('lotNumber')}
                />
                {errors.lotNumber && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.lotNumber.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="title">Título del Lote *</Label>
                <Input
                  id="title"
                  placeholder="Ej: Renault Kwid Zen 1.0 /2020"
                  {...register('title')}
                />
                {errors.title && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.title.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                rows={4}
                placeholder="Descripción detallada del lote..."
                {...register('description')}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="currency">Moneda</Label>
                <Select
                  value={watch('currency')}
                  onValueChange={(value) => setValue('currency', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar moneda" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ARS">Pesos Argentinos (ARS)</SelectItem>
                    <SelectItem value="USD">Dólares (USD)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="startingPrice">Precio Base *</Label>
                <Input
                  id="startingPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  {...register('startingPrice')}
                />
                {errors.startingPrice && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.startingPrice.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="currentPrice">Precio Actual (opcional)</Label>
                <Input
                  id="currentPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  {...register('currentPrice')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detalles técnicos */}
        <Card>
          <CardHeader>
            <CardTitle>Detalles Técnicos</CardTitle>
          </CardHeader>
          <CardContent>
            <RichTextEditor
              value={watch('details') || ''}
              onChange={(value: string) => setValue('details', value)}
              placeholder="Detalles técnicos del vehículo..."
            />
          </CardContent>
        </Card>

        {/* Imágenes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Imágenes ({totalImages}/15)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Imágenes existentes */}
            {existingImages.length > 0 && (
              <div>
                <Label className="mb-2 block">Imágenes actuales</Label>
                <div className="grid grid-cols-5 gap-2">
                  {existingImages.map((img) => (
                    <div key={img.id} className="relative group">
                      <img
                        src={img.url}
                        alt=""
                        className="w-full h-24 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(img.id)}
                        className="absolute top-1 right-1 p-1 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      {img.isPrimary && (
                        <span className="absolute bottom-1 left-1 text-xs bg-primary text-white px-1 rounded">
                          Principal
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nuevas imágenes */}
            {newFiles.length > 0 && (
              <div>
                <Label className="mb-2 block">Nuevas imágenes</Label>
                <div className="grid grid-cols-5 gap-2">
                  {newFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt=""
                        className="w-full h-24 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewFile(index)}
                        className="absolute top-1 right-1 p-1 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Subir nuevas imágenes */}
            {totalImages < 15 && (
              <FileUpload
                accept="image/*"
                multiple
                maxFiles={15 - totalImages}
                onFilesChange={handleFilesChange}
                helperText={`Podés subir hasta ${15 - totalImages} imágenes más`}
              />
            )}
          </CardContent>
        </Card>

        {/* Videos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Videos de YouTube
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {videoUrls.map((url, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="https://youtube.com/watch?v=..."
                  value={url}
                  onChange={(e) => updateVideoUrl(index, e.target.value)}
                  className="flex-1"
                />
                {videoUrls.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeVideoField(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addVideoField}
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Video
            </Button>
          </CardContent>
        </Card>

        {/* Botones */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/auctions/${auctionId}/lots`)}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {(createMutation.isPending || updateMutation.isPending) && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            )}
            {isEditing ? 'Actualizar Lote' : 'Crear Lote'}
          </Button>
        </div>
      </form>
    </div>
  );
}

