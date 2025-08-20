import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { practiceAreaService } from '../lib/api';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Save, X, GripVertical } from 'lucide-react';

interface PracticeArea {
  id: string;
  title: string;
  description: string;
  icon?: string;
  order: number;
  isActive: boolean;
}

export default function PracticeAreasPage() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newArea, setNewArea] = useState({
    title: '',
    description: '',
    icon: '',
  });
  const [showForm, setShowForm] = useState(false);

  const { data: areas, isLoading } = useQuery({
    queryKey: ['practice-areas'],
    queryFn: async () => {
      const response = await practiceAreaService.getAll();
      return response.data.data as PracticeArea[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return practiceAreaService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['practice-areas'] });
      toast.success('Área de práctica creada');
      setNewArea({ title: '', description: '', icon: '' });
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return practiceAreaService.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['practice-areas'] });
      toast.success('Área de práctica actualizada');
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return practiceAreaService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['practice-areas'] });
      toast.success('Área de práctica eliminada');
    },
  });

  const handleCreate = () => {
    if (newArea.title && newArea.description) {
      createMutation.mutate(newArea);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Está seguro de eliminar esta área de práctica?')) {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Áreas de Práctica</h1>
          <p className="text-muted-foreground">
            Gestione las áreas de práctica del estudio
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Área
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nueva Área de Práctica</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="new-title">Título</Label>
                <Input
                  id="new-title"
                  value={newArea.title}
                  onChange={(e) =>
                    setNewArea({ ...newArea, title: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="new-description">Descripción</Label>
                <textarea
                  id="new-description"
                  className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                  value={newArea.description}
                  onChange={(e) =>
                    setNewArea({ ...newArea, description: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="new-icon">Icono (opcional)</Label>
                <Input
                  id="new-icon"
                  value={newArea.icon}
                  onChange={(e) =>
                    setNewArea({ ...newArea, icon: e.target.value })
                  }
                  placeholder="briefcase, scale, shield, gavel"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleCreate}
                  disabled={createMutation.isPending}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Guardar
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {areas?.map((area, index) => (
          <Card key={area.id}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="cursor-move">
                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  {editingId === area.id ? (
                    <div className="space-y-4">
                      <Input
                        value={area.title}
                        onChange={(e) => {
                          const updated = [...(areas || [])];
                          updated[index] = { ...area, title: e.target.value };
                        }}
                      />
                      <textarea
                        className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                        value={area.description}
                        onChange={(e) => {
                          const updated = [...(areas || [])];
                          updated[index] = {
                            ...area,
                            description: e.target.value,
                          };
                        }}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            updateMutation.mutate({ id: area.id, data: area });
                          }}
                        >
                          <Save className="mr-2 h-4 w-4" />
                          Guardar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingId(null)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className="font-semibold">{area.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {area.description}
                      </p>
                      {area.icon && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Icono: {area.icon}
                        </p>
                      )}
                    </>
                  )}
                </div>
                {editingId !== area.id && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingId(area.id)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(area.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
