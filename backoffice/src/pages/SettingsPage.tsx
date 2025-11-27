import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '../lib/api';
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
import { Save } from 'lucide-react';

interface Setting {
  id: string;
  key: string;
  value: any;
  description?: string;
}

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [editedSettings, setEditedSettings] = useState<Record<string, any>>({});

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await settingsService.getAll();
      return response.data.data as Setting[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      return settingsService.update(key, value);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Configuración actualizada');
      setEditedSettings({});
    },
  });

  const handleSave = (key: string) => {
    const value = editedSettings[key];
    if (value !== undefined) {
      updateMutation.mutate({ key, value });
    }
  };

  const handleChange = (key: string, value: string) => {
    setEditedSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const settingGroups = {
    contact: {
      title: 'Información de Contacto',
      settings: ['contact_email', 'contact_phone', 'contact_address'],
    },
    social: {
      title: 'Redes Sociales',
      settings: ['social_links'],
    },
    auctions: {
      title: 'Configuración de Subastas',
      settings: ['auction_terms_conditions'],
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">
          Configuración general del sistema
        </p>
      </div>

      {Object.entries(settingGroups).map(([groupKey, group]) => (
        <Card key={groupKey}>
          <CardHeader>
            <CardTitle>{group.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {settings
                ?.filter((setting) => group.settings.includes(setting.key))
                .map((setting) => (
                  <div key={setting.id} className="space-y-2">
                    <Label htmlFor={setting.key}>
                      {setting.description || setting.key}
                    </Label>
                    {setting.key === 'social_links' ? (
                      <div className="space-y-2">
                        {Object.entries(
                          (editedSettings[setting.key] ||
                            setting.value) as Record<string, string>
                        ).map(([platform, url]) => (
                          <div key={platform} className="flex gap-2">
                            <Label className="w-24 pt-2 capitalize">
                              {platform}
                            </Label>
                            <Input
                              value={url}
                              onChange={(e) => {
                                const newValue = {
                                  ...(editedSettings[setting.key] ||
                                    setting.value),
                                  [platform]: e.target.value,
                                };
                                handleChange(setting.key, newValue);
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    ) : setting.key === 'contact_address' ? (
                      <div className="space-y-2">
                        {Object.entries(
                          (editedSettings[setting.key] ||
                            setting.value) as Record<string, string>
                        ).map(([field, value]) => (
                          <div key={field} className="space-y-1">
                            <Label className="capitalize">
                              {field === 'address' ? 'Dirección' : 'Teléfono'}
                            </Label>
                            <Input
                              value={value}
                              placeholder={
                                field === 'address'
                                  ? 'Av. Corrientes 1234, CABA'
                                  : '(011) 1234-5678'
                              }
                              onChange={(e) => {
                                const newValue = {
                                  ...(editedSettings[setting.key] ||
                                    setting.value),
                                  [field]: e.target.value,
                                };
                                handleChange(setting.key, newValue);
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Input
                        id={setting.key}
                        value={editedSettings[setting.key] ?? setting.value}
                        onChange={(e) =>
                          handleChange(setting.key, e.target.value)
                        }
                      />
                    )}
                    {editedSettings[setting.key] !== undefined && (
                      <Button
                        size="sm"
                        onClick={() => handleSave(setting.key)}
                        disabled={updateMutation.isPending}
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Guardar
                      </Button>
                    )}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
