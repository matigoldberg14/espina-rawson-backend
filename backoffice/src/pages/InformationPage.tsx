import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs';
import { informationService } from '../lib/api';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  FileText,
  Video,
  Image,
  ExternalLink,
} from 'lucide-react';

interface Information {
  id: string;
  title: string;
  description: string;
  type: 'ARTICLE' | 'VIDEO' | 'IMAGE';
  url?: string;
  thumbnail?: string;
  author: string;
  publishDate: string;
  tags: string[];
  category: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

const InformationPage: React.FC = () => {
  const [information, setInformation] = useState<Information[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Information | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'ARTICLE' as const,
    url: '',
    thumbnail: '',
    author: '',
    publishDate: new Date().toISOString().split('T')[0],
    tags: '',
    category: '',
    isActive: true,
    order: 0,
  });

  useEffect(() => {
    fetchInformation();
  }, []);

  const fetchInformation = async () => {
    try {
      setLoading(true);
      const response = await informationService.getAll();
      setInformation(response.data);
    } catch (error) {
      console.error('Error fetching information:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        tags: formData.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        publishDate: new Date(formData.publishDate).toISOString(),
      };

      if (editingItem) {
        await informationService.update(editingItem.id, data);
      } else {
        await informationService.create(data);
      }

      await fetchInformation();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving information:', error);
    }
  };

  const handleEdit = (item: Information) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      type: item.type,
      url: item.url || '',
      thumbnail: item.thumbnail || '',
      author: item.author,
      publishDate: item.publishDate.split('T')[0],
      tags: item.tags.join(', '),
      category: item.category,
      isActive: item.isActive,
      order: item.order,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (
      window.confirm('¿Estás seguro de que quieres eliminar este elemento?')
    ) {
      try {
        await informationService.delete(id);
        await fetchInformation();
      } catch (error) {
        console.error('Error deleting information:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'ARTICLE',
      url: '',
      thumbnail: '',
      author: '',
      publishDate: new Date().toISOString().split('T')[0],
      tags: '',
      category: '',
      isActive: true,
      order: 0,
    });
    setEditingItem(null);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ARTICLE':
        return <FileText className="h-4 w-4" />;
      case 'VIDEO':
        return <Video className="h-4 w-4" />;
      case 'IMAGE':
        return <Image className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ARTICLE':
        return 'bg-blue-100 text-blue-800';
      case 'VIDEO':
        return 'bg-red-100 text-red-800';
      case 'IMAGE':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredInformation = information.filter((item) => {
    if (activeTab === 'all') return true;
    return item.type.toLowerCase() === activeTab;
  });

  const stats = {
    total: information.length,
    articles: information.filter((item) => item.type === 'ARTICLE').length,
    videos: information.filter((item) => item.type === 'VIDEO').length,
    images: information.filter((item) => item.type === 'IMAGE').length,
    active: information.filter((item) => item.isActive).length,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gestión de Información
          </h1>
          <p className="text-gray-600">
            Administra artículos, videos e imágenes para la sección informativa
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Información
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem
                  ? 'Editar Información'
                  : 'Agregar Nueva Información'}
              </DialogTitle>
              <DialogDescription>
                Completa los campos para {editingItem ? 'actualizar' : 'crear'}{' '}
                el elemento informativo.
              </DialogDescription>
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
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">Tipo *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value as any })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ARTICLE">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Artículo
                        </div>
                      </SelectItem>
                      <SelectItem value="VIDEO">
                        <div className="flex items-center gap-2">
                          <Video className="h-4 w-4" />
                          Video
                        </div>
                      </SelectItem>
                      <SelectItem value="IMAGE">
                        <div className="flex items-center gap-2">
                          <Image className="h-4 w-4" />
                          Imagen/Galería
                        </div>
                      </SelectItem>
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
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="url">URL del Contenido</Label>
                  <Input
                    id="url"
                    value={formData.url}
                    onChange={(e) =>
                      setFormData({ ...formData, url: e.target.value })
                    }
                    placeholder="https://example.com/archivo.pdf"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.type === 'ARTICLE' && 'URL del PDF o artículo'}
                    {formData.type === 'VIDEO' &&
                      'URL del video (YouTube, Vimeo, etc.)'}
                    {formData.type === 'IMAGE' &&
                      'URL de la galería o imagen principal'}
                  </p>
                </div>
                <div>
                  <Label htmlFor="thumbnail">Imagen Miniatura</Label>
                  <Input
                    id="thumbnail"
                    value={formData.thumbnail}
                    onChange={(e) =>
                      setFormData({ ...formData, thumbnail: e.target.value })
                    }
                    placeholder="https://example.com/thumbnail.jpg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="author">Autor *</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) =>
                      setFormData({ ...formData, author: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="publishDate">Fecha de Publicación *</Label>
                  <Input
                    id="publishDate"
                    type="date"
                    value={formData.publishDate}
                    onChange={(e) =>
                      setFormData({ ...formData, publishDate: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Categoría *</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    placeholder="Ej: Subastas, Legal, Educativo"
                    required
                  />
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
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="tags">Tags (separados por comas)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData({ ...formData, tags: e.target.value })
                  }
                  placeholder="subasta, legal, tutorial"
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
                <Label htmlFor="isActive">Elemento activo</Label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingItem ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Artículos</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.articles}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Videos</CardTitle>
            <Video className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.videos}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Imágenes</CardTitle>
            <Image className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.images}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <Eye className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and Table */}
      <Card>
        <CardHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="article">Artículos</TabsTrigger>
              <TabsTrigger value="video">Videos</TabsTrigger>
              <TabsTrigger value="image">Imágenes</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Cargando...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Autor</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInformation.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {item.thumbnail && (
                          <img
                            src={item.thumbnail}
                            alt={item.title}
                            className="w-10 h-10 object-cover rounded"
                          />
                        )}
                        <div>
                          <div className="font-medium">{item.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {item.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(item.type)}>
                        <div className="flex items-center gap-1">
                          {getTypeIcon(item.type)}
                          {item.type}
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>{item.author}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.isActive ? 'default' : 'secondary'}>
                        {item.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(item.publishDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {item.url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(item.url, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InformationPage;
