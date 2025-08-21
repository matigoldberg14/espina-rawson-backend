import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  FileText,
  Image,
  Type,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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

interface StudioContent {
  id: string;
  section: string;
  title?: string;
  subtitle?: string;
  content: string;
  image?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateStudioContentData {
  section: string;
  title?: string;
  subtitle?: string;
  content: string;
  image?: string;
  order: number;
  isActive: boolean;
}

const SECTION_OPTIONS = [
  {
    value: 'hero',
    label: 'Hero Principal',
    description: 'Título y subtítulo principal de la página',
  },
  {
    value: 'history',
    label: 'Historia del Estudio',
    description: 'Sección de historia y fundación',
  },
  {
    value: 'clients_intro',
    label: 'Introducción a Clientes',
    description: 'Texto introductorio de la sección de clientes',
  },
  {
    value: 'about_intro',
    label: 'Introducción Sobre Nosotros',
    description: 'Texto introductorio de la sección sobre nosotros',
  },
  {
    value: 'practice_intro',
    label: 'Introducción Áreas de Práctica',
    description: 'Texto introductorio de las áreas de práctica',
  },
];

const StudioContentPage: React.FC = () => {
  const [studioContent, setStudioContent] = useState<StudioContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<StudioContent | null>(
    null
  );
  const [formData, setFormData] = useState<CreateStudioContentData>({
    section: 'hero',
    title: '',
    subtitle: '',
    content: '',
    image: '',
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchStudioContent();
  }, []);

  const fetchStudioContent = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/studio-content/admin', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStudioContent(data.data || []);
      } else {
        throw new Error('Error al cargar contenido del estudio');
      }
    } catch (error) {
      console.error('Error fetching studio content:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar el contenido del estudio',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingContent
        ? `/api/studio-content/${editingContent.id}`
        : '/api/studio-content';

      const method = editingContent ? 'PUT' : 'POST';

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
          description: editingContent
            ? 'Contenido del estudio actualizado correctamente'
            : 'Contenido del estudio creado correctamente',
        });

        setIsCreateDialogOpen(false);
        setEditingContent(null);
        resetForm();
        fetchStudioContent();
      } else {
        throw new Error('Error en la operación');
      }
    } catch (error) {
      console.error('Error submitting studio content:', error);
      toast({
        title: 'Error',
        description: 'No se pudo completar la operación',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (content: StudioContent) => {
    setEditingContent(content);
    setFormData({
      section: content.section,
      title: content.title || '',
      subtitle: content.subtitle || '',
      content: content.content,
      image: content.image || '',
      order: content.order,
      isActive: content.isActive,
    });
    setIsCreateDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/studio-content/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        toast({
          title: 'Éxito',
          description: 'Contenido del estudio eliminado correctamente',
        });
        fetchStudioContent();
      } else {
        throw new Error('Error al eliminar');
      }
    } catch (error) {
      console.error('Error deleting studio content:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el contenido del estudio',
        variant: 'destructive',
      });
    }
  };

  const handleToggleActive = async (content: StudioContent) => {
    try {
      const response = await fetch(`/api/studio-content/${content.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ isActive: !content.isActive }),
      });

      if (response.ok) {
        toast({
          title: 'Éxito',
          description: `Contenido del estudio ${
            !content.isActive ? 'activado' : 'desactivado'
          } correctamente`,
        });
        fetchStudioContent();
      } else {
        throw new Error('Error al actualizar');
      }
    } catch (error) {
      console.error('Error toggling studio content:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      section: 'hero',
      title: '',
      subtitle: '',
      content: '',
      image: '',
      order: 0,
      isActive: true,
    });
  };

  const openCreateDialog = () => {
    setEditingContent(null);
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const getSectionLabel = (section: string) => {
    const option = SECTION_OPTIONS.find((opt) => opt.value === section);
    return option ? option.label : section;
  };

  const getSectionDescription = (section: string) => {
    const option = SECTION_OPTIONS.find((opt) => opt.value === section);
    return option ? option.description : '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            Cargando contenido del estudio...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Contenido del Estudio</h1>
          <p className="text-muted-foreground">
            Gestiona el contenido estático del estudio
          </p>
        </div>
        <Button onClick={openCreateDialog} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Contenido
        </Button>
      </div>

      <div className="grid gap-4">
        {studioContent.map((content) => (
          <Card
            key={content.id}
            className={!content.isActive ? 'opacity-60' : ''}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Type className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">
                        {getSectionLabel(content.section)}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {getSectionDescription(content.section)}
                      </p>
                    </div>
                  </div>

                  {content.title && (
                    <div className="mb-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        Título:
                      </span>
                      <p className="text-base">{content.title}</p>
                    </div>
                  )}

                  {content.subtitle && (
                    <div className="mb-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        Subtítulo:
                      </span>
                      <p className="text-base">{content.subtitle}</p>
                    </div>
                  )}

                  <div className="mb-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Contenido:
                    </span>
                    <p className="text-base text-muted-foreground">
                      {content.content}
                    </p>
                  </div>

                  {content.image && (
                    <div className="mb-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        Imagen:
                      </span>
                      <div className="mt-1">
                        <img
                          src={content.image}
                          alt="Imagen del contenido"
                          className="h-20 w-32 object-cover rounded border"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                    <span>Orden: {content.order}</span>
                    <span>
                      Estado: {content.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                    <span>Sección: {content.section}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(content)}
                  >
                    {content.isActive ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(content)}
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
                          permanentemente el contenido del estudio.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(content.id)}
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
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {editingContent
                ? 'Editar Contenido del Estudio'
                : 'Nuevo Contenido del Estudio'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="section">Sección *</Label>
                <Select
                  value={formData.section}
                  onValueChange={(value) =>
                    setFormData({ ...formData, section: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar sección" />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTION_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-sm text-muted-foreground">
                            {option.description}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Título opcional"
                />
              </div>
              <div>
                <Label htmlFor="subtitle">Subtítulo</Label>
                <Input
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) =>
                    setFormData({ ...formData, subtitle: e.target.value })
                  }
                  placeholder="Subtítulo opcional"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="content">Contenido *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="Contenido principal del texto..."
                rows={4}
                required
              />
            </div>

            <div>
              <Label htmlFor="image">URL de la Imagen</Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
                placeholder="https://example.com/image.jpg"
              />
              {formData.image && (
                <div className="mt-2">
                  <img
                    src={formData.image}
                    alt="Vista previa"
                    className="h-32 w-48 object-cover rounded border"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
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

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setEditingContent(null);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {editingContent ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudioContentPage;
