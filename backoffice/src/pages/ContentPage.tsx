import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contentService } from '../lib/api';
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
import { Edit2, Save, X } from 'lucide-react';

interface Content {
  id: string;
  key: string;
  value: string;
  description?: string;
  section: string;
}

export default function ContentPage() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<Content | null>(null);

  const { data: contents, isLoading } = useQuery({
    queryKey: ['contents'],
    queryFn: async () => {
      const response = await contentService.getAll();
      return response.data.data as Content[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (content: Content) => {
      return contentService.update(content.id, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contents'] });
      toast.success('Contenido actualizado');
      setEditingId(null);
      setEditedContent(null);
    },
  });

  const handleEdit = (content: Content) => {
    setEditingId(content.id);
    setEditedContent({ ...content });
  };

  const handleSave = () => {
    if (editedContent) {
      updateMutation.mutate(editedContent);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedContent(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Group contents by section
  const groupedContents = contents?.reduce((acc, content) => {
    if (!acc[content.section]) {
      acc[content.section] = [];
    }
    acc[content.section].push(content);
    return acc;
  }, {} as Record<string, Content[]>);

  const sectionTitles: Record<string, string> = {
    hero: 'Hero / Página Principal',
    about: 'Sobre Nosotros',
    expertise: 'Áreas de Expertise',
    auctions: 'Subastas',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestión de Contenido</h1>
        <p className="text-muted-foreground">
          Edite los textos que aparecen en el sitio web
        </p>
      </div>

      {Object.entries(groupedContents || {}).map(
        ([section, sectionContents]) => (
          <Card key={section}>
            <CardHeader>
              <CardTitle>{sectionTitles[section] || section}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sectionContents.map((content) => (
                  <div key={content.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{content.key}</h4>
                        {content.description && (
                          <p className="text-xs text-muted-foreground">
                            {content.description}
                          </p>
                        )}
                      </div>
                      {editingId !== content.id && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(content)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {editingId === content.id ? (
                      <div className="space-y-2">
                        <Label htmlFor={`value-${content.id}`}>Valor</Label>
                        <textarea
                          id={`value-${content.id}`}
                          className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                          value={editedContent?.value || ''}
                          onChange={(e) =>
                            setEditedContent((prev) =>
                              prev ? { ...prev, value: e.target.value } : null
                            )
                          }
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={updateMutation.isPending}
                          >
                            <Save className="h-4 w-4 mr-1" />
                            Guardar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancel}
                            disabled={updateMutation.isPending}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">
                        {content.value}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
}
