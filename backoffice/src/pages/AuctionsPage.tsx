import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { auctionService } from '../lib/api';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { formatCurrency, formatDateTime } from '../lib/utils';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Star, StarOff, Eye, EyeOff } from 'lucide-react';

interface Auction {
  id: string;
  title: string;
  description: string;
  location?: string;
  startingPrice: number;
  currentPrice?: number;
  endDate: string;
  status: string;
  isFeatured: boolean;
  createdAt: string;
  _count?: {
    bids: number;
  };
}

export default function AuctionsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: auctions, isLoading } = useQuery({
    queryKey: ['auctions', statusFilter],
    queryFn: async () => {
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const response = await auctionService.getAll(params);
      return response.data.data as Auction[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return auctionService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auctions'] });
      toast.success('Subasta eliminada');
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return auctionService.updateStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auctions'] });
      toast.success('Estado actualizado');
    },
  });

  const featuredMutation = useMutation({
    mutationFn: async (auctionIds: string[]) => {
      return auctionService.updateFeatured(auctionIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auctions'] });
      toast.success('Subastas destacadas actualizadas');
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('¿Está seguro de eliminar esta subasta?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleStatus = (auction: Auction) => {
    const newStatus = auction.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    statusMutation.mutate({ id: auction.id, status: newStatus });
  };

  const handleToggleFeatured = (auction: Auction) => {
    if (!auction.isFeatured) {
      // Add to featured
      const currentFeatured =
        auctions?.filter((a) => a.isFeatured).map((a) => a.id) || [];
      if (currentFeatured.length >= 3) {
        toast.error('Solo se pueden destacar hasta 3 subastas');
        return;
      }
      featuredMutation.mutate([...currentFeatured, auction.id]);
    } else {
      // Remove from featured
      const newFeatured =
        auctions
          ?.filter((a) => a.isFeatured && a.id !== auction.id)
          .map((a) => a.id) || [];
      featuredMutation.mutate(newFeatured);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const statuses = [
    { value: 'all', label: 'Todas' },
    { value: 'DRAFT', label: 'Borrador' },
    { value: 'PUBLISHED', label: 'Publicadas' },
    { value: 'ENDED', label: 'Finalizadas' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subastas</h1>
          <p className="text-muted-foreground">
            Gestione las subastas del sitio
          </p>
        </div>
        <Button asChild>
          <Link to="/auctions/new">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Subasta
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {statuses.map((status) => (
          <Button
            key={status.value}
            variant={statusFilter === status.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(status.value)}
          >
            {status.label}
          </Button>
        ))}
      </div>

      {/* Auctions List */}
      <div className="grid gap-4">
        {auctions?.map((auction) => (
          <Card key={auction.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl">{auction.title}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{auction.location}</span>
                    <span>•</span>
                    <span>Finaliza: {formatDateTime(auction.endDate)}</span>
                    <span>•</span>
                    <span>{auction._count?.bids || 0} ofertas</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleFeatured(auction)}
                    title={
                      auction.isFeatured ? 'Quitar de destacadas' : 'Destacar'
                    }
                  >
                    {auction.isFeatured ? (
                      <Star className="h-4 w-4 fill-primary text-primary" />
                    ) : (
                      <StarOff className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleStatus(auction)}
                    title={
                      auction.status === 'PUBLISHED'
                        ? 'Despublicar'
                        : 'Publicar'
                    }
                  >
                    {auction.status === 'PUBLISHED' ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </Button>
                  <Button variant="ghost" size="icon" asChild>
                    <Link to={`/auctions/${auction.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(auction.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Precio inicial
                  </p>
                  <p className="font-medium">
                    {formatCurrency(auction.startingPrice)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Precio actual</p>
                  <p className="font-medium">
                    {formatCurrency(
                      auction.currentPrice || auction.startingPrice
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs ${
                      auction.status === 'PUBLISHED'
                        ? 'bg-green-100 text-green-800'
                        : auction.status === 'DRAFT'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {auction.status}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
