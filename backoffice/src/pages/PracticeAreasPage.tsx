import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, GripVertical } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { toast } from '../hooks/use-toast';

interface PracticeArea {
  id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreatePracticeAreaData {
  title: string;
  description: string;
  icon: string;
  order: number;
  isActive: boolean;
}

const ICON_OPTIONS = [
  'Briefcase',
  'Gavel',
  'Scale',
  'Shield',
  'Building',
  'Factory',
  'Users',
  'FileText',
  'BookOpen',
  'Award',
  'Target',
  'TrendingUp',
  'Zap',
  'Star',
  'Heart',
  'Globe',
  'MapPin',
  'Phone',
  'Mail',
];

const PracticeAreasPage: React.FC = () => {
  const [practiceAreas, setPracticeAreas] = useState<PracticeArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<PracticeArea | null>(null);
  const [formData, setFormData] = useState<CreatePracticeAreaData>({
    title: '',
    description: '',
    icon: 'Briefcase',
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchPracticeAreas();
  }, []);

  const fetchPracticeAreas = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/practice-areas/admin', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPracticeAreas(data.data || []);
      } else {
        throw new Error('Error al cargar áreas de práctica');
      }
    } catch (error) {
      console.error('Error fetching practice areas:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las áreas de práctica',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingArea
        ? `/api/practice-areas/${editingArea.id}`
        : '/api/practice-areas';

      const method = editingArea ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Éxito',
          description: editingArea
            ? 'Área de práctica actualizada correctamente'
            : 'Área de práctica creada correctamente',
        });

        setIsCreateDialogOpen(false);
        setEditingArea(null);
        resetForm();
        fetchPracticeAreas();
      } else {
        throw new Error('Error en la operación');
      }
    } catch (error) {
      console.error('Error submitting practice area:', error);
      toast({
        title: 'Error',
        description: 'No se pudo completar la operación',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (area: PracticeArea) => {
    setEditingArea(area);
    setFormData({
      title: area.title,
      description: area.description,
      icon: area.icon,
      order: area.order,
      isActive: area.isActive,
    });
    setIsCreateDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/practice-areas/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        toast({
          title: 'Éxito',
          description: 'Área de práctica eliminada correctamente',
        });
        fetchPracticeAreas();
      } else {
        throw new Error('Error al eliminar');
      }
    } catch (error) {
      console.error('Error deleting practice area:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el área de práctica',
        variant: 'destructive',
      });
    }
  };

  const handleToggleActive = async (area: PracticeArea) => {
    try {
      const response = await fetch(`/api/practice-areas/${area.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ isActive: !area.isActive }),
      });

      if (response.ok) {
        toast({
          title: 'Éxito',
          description: `Área de práctica ${
            !area.isActive ? 'activada' : 'desactivada'
          } correctamente`,
        });
        fetchPracticeAreas();
      } else {
        throw new Error('Error al actualizar');
      }
    } catch (error) {
      console.error('Error toggling practice area:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      icon: 'Briefcase',
      order: 0,
      isActive: true,
    });
  };

  const openCreateDialog = () => {
    setEditingArea(null);
    resetForm();
    setIsCreateDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            Cargando áreas de práctica...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Áreas de Práctica</h1>
          <p className="text-muted-foreground">
            Gestiona las áreas de práctica del estudio
          </p>
        </div>
        <Button onClick={openCreateDialog} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nueva Área
        </Button>
      </div>

      <div className="grid gap-4">
        {practiceAreas.map((area) => (
          <Card key={area.id} className={!area.isActive ? 'opacity-60' : ''}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <span className="text-primary font-semibold">
                      {area.icon}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{area.title}</h3>
                    <p className="text-muted-foreground">{area.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>Orden: {area.order}</span>
                      <span>
                        Estado: {area.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(area)}
                  >
                    {area.isActive ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(area)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción no se puede deshacer. Se eliminará
                          permanentemente el área de práctica.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(area.id)}
                        >
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingArea
                ? 'Editar Área de Práctica'
                : 'Nueva Área de Práctica'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Derecho Corporativo y M&A"
                  required
                />
              </div>
              <div>
                <Label htmlFor="icon">Icono *</Label>
                <Select
                  value={formData.icon}
                  onValueChange={(value) =>
                    setFormData({ ...formData, icon: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar icono" />
                  </SelectTrigger>
                  <SelectContent>
                    {ICON_OPTIONS.map((icon) => (
                      <SelectItem key={icon} value={icon}>
                        {icon}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descripción *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Asesoramiento en fusiones, adquisiciones, gobierno corporativo..."
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="order">Orden</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      order: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="0"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                />
                <Label htmlFor="isActive">Activo</Label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setEditingArea(null);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {editingArea ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PracticeAreasPage;
