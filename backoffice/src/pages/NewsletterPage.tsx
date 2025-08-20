import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { newsletterService } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import toast from 'react-hot-toast';
import { Mail, Users, Send, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function NewsletterPage() {
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [testMode, setTestMode] = useState(true);

  const { data: subscribers, refetch: refetchSubscribers } = useQuery({
    queryKey: ['subscribers'],
    queryFn: async () => {
      const response = await newsletterService.getSubscribers();
      return response.data;
    },
  });

  const { data: campaigns } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const response = await newsletterService.getCampaigns();
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return newsletterService.deleteSubscriber(id);
    },
    onSuccess: () => {
      toast.success('Suscriptor eliminado');
      refetchSubscribers();
    },
  });

  const sendCampaignMutation = useMutation({
    mutationFn: async (data: {
      subject: string;
      content: string;
      testMode: boolean;
    }) => {
      return newsletterService.sendCampaign(data);
    },
    onSuccess: (response) => {
      toast.success(response.data.message);
      setShowCampaignForm(false);
      setSubject('');
      setContent('');
      setTestMode(true);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.error?.message || 'Error al enviar campaña'
      );
    },
  });

  const handleSendCampaign = () => {
    if (!subject || !content) {
      toast.error('Por favor complete todos los campos');
      return;
    }
    sendCampaignMutation.mutate({ subject, content, testMode });
  };

  const activeSubscribers =
    subscribers?.data?.filter((s: any) => s.isActive) || [];
  const totalSubscribers = activeSubscribers.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Newsletter</h1>
        <Button
          onClick={() => setShowCampaignForm(!showCampaignForm)}
          className="flex items-center gap-2"
        >
          <Send className="h-4 w-4" />
          Nueva Campaña
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Suscriptores Activos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubscribers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Campañas Enviadas
            </CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns?.data?.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Última Campaña
            </CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {campaigns?.data?.[0]?.sentAt
                ? format(new Date(campaigns.data[0].sentAt), 'dd MMM yyyy', {
                    locale: es,
                  })
                : 'Nunca'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Formulario de campaña */}
      {showCampaignForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nueva Campaña de Email</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Asunto</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Asunto del email"
                disabled={sendCampaignMutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Contenido (HTML)</Label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Contenido del email en formato HTML"
                className="w-full min-h-[200px] rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                disabled={sendCampaignMutation.isPending}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="testMode"
                checked={testMode}
                onChange={(e) => setTestMode(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
                disabled={sendCampaignMutation.isPending}
              />
              <Label htmlFor="testMode" className="text-sm font-normal">
                Modo de prueba (solo enviar al administrador)
              </Label>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSendCampaign}
                disabled={sendCampaignMutation.isPending}
              >
                {sendCampaignMutation.isPending
                  ? 'Enviando...'
                  : testMode
                  ? 'Enviar Prueba'
                  : `Enviar a ${totalSubscribers} suscriptores`}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCampaignForm(false);
                  setSubject('');
                  setContent('');
                }}
                disabled={sendCampaignMutation.isPending}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de suscriptores */}
      <Card>
        <CardHeader>
          <CardTitle>Suscriptores</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha de suscripción</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscribers?.data?.map((subscriber: any) => (
                <TableRow key={subscriber.id}>
                  <TableCell>{subscriber.email}</TableCell>
                  <TableCell>{subscriber.name || '-'}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        subscriber.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {subscriber.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {format(new Date(subscriber.subscribedAt), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteMutation.mutate(subscriber.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Historial de campañas */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Campañas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asunto</TableHead>
                <TableHead>Enviado a</TableHead>
                <TableHead>Fecha de envío</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns?.data?.map((campaign: any) => (
                <TableRow key={campaign.id}>
                  <TableCell>{campaign.subject}</TableCell>
                  <TableCell>{campaign.sentTo} suscriptores</TableCell>
                  <TableCell>
                    {campaign.sentAt
                      ? format(new Date(campaign.sentAt), 'dd/MM/yyyy HH:mm', {
                          locale: es,
                        })
                      : 'No enviado'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
