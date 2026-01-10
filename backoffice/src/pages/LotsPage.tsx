import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { lotService, auctionService } from '../lib/api';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { formatCurrency } from '../lib/utils';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, ArrowLeft, Image, Video, Package } from 'lucide-react';

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
  order: number;
}

interface Lot {
  id: string;
  lotNumber: number;
  title: string;
  description?: string;
  currency: string;
  startingPrice: number;
  currentPrice?: number;
  images: LotImage[];
  videos: LotVideo[];
  isActive: boolean;
  createdAt: string;
}

interface Auction {
  id: string;
  title: string;
  status: string;
}

export default function LotsPage() {
  const { auctionId } = useParams<{ auctionId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Obtener datos de la subasta
  const { data: auction } = useQuery({
    queryKey: ['auction', auctionId],
    queryFn: async () => {
      const response = await auctionService.getById(auctionId!);
      return response.data.data as Auction;
    },
    enabled: !!auctionId,
  });

  // Obtener lotes de la subasta
  const { data: lots, isLoading } = useQuery({
    queryKey: ['lots', auctionId],
    queryFn: async () => {
      const response = await lotService.getByAuction(auctionId!);
      return response.data.data as Lot[];
    },
    enabled: !!auctionId,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return lotService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lots', auctionId] });
      toast.success('Lote eliminado');
    },
  });

  const handleDelete = (id: string, lotNumber: number) => {
    if (confirm(`¿Está seguro de eliminar el Lote ${lotNumber}?`)) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/auctions')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Subastas
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Lotes de la Subasta</h1>
          {auction && (
            <p className="text-muted-foreground">{auction.title}</p>
          )}
        </div>
        <Link to={`/auctions/${auctionId}/lots/new`}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Lote
          </Button>
        </Link>
      </div>

      {/* Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span>{lots?.length || 0} lotes</span>
            </div>
            <div>•</div>
            <div>Máximo 15 fotos por lote</div>
            <div>•</div>
            <div>Videos de YouTube ilimitados</div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Lotes */}
      {lots && lots.length > 0 ? (
        <div className="grid gap-4">
          {lots.map((lot) => (
            <Card key={lot.id} className="overflow-hidden">
              <div className="flex">
                {/* Imagen principal */}
                <div className="w-48 h-36 bg-muted flex-shrink-0">
                  {lot.images.length > 0 ? (
                    <img
                      src={lot.images[0].url}
                      alt={lot.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Image className="h-8 w-8" />
                    </div>
                  )}
                </div>

                {/* Contenido */}
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
                          Lote {lot.lotNumber}
                        </span>
                        {!lot.isActive && (
                          <span className="px-2 py-1 bg-destructive/10 text-destructive text-xs font-medium rounded">
                            Inactivo
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold mt-1">{lot.title}</h3>
                      {lot.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {lot.description}
                        </p>
                      )}
                    </div>

                    {/* Precio */}
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Base</p>
                      <p className="font-bold text-lg">
                        {formatCurrency(lot.startingPrice, lot.currency)}
                      </p>
                    </div>
                  </div>

                  {/* Stats e iconos */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Image className="h-4 w-4" />
                        <span>{lot.images.length} fotos</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Video className="h-4 w-4" />
                        <span>{lot.videos.length} videos</span>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-2">
                      <Link to={`/auctions/${auctionId}/lots/${lot.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(lot.id, lot.lotNumber)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay lotes</h3>
            <p className="text-muted-foreground mb-4">
              Esta subasta aún no tiene lotes. Agregá el primer lote para comenzar.
            </p>
            <Link to={`/auctions/${auctionId}/lots/new`}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Primer Lote
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

