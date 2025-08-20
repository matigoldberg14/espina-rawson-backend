import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../lib/api';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { formatCurrency, formatDateTime } from '../lib/utils';
import {
  Gavel,
  Users,
  FileText,
  TrendingUp,
  Calendar,
  Activity,
} from 'lucide-react';

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await dashboardService.getStats();
      return response.data.data;
    },
  });

  const { data: activity } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      const response = await dashboardService.getRecentActivity();
      return response.data.data;
    },
  });

  const { data: upcomingAuctions } = useQuery({
    queryKey: ['upcoming-auctions'],
    queryFn: async () => {
      const response = await dashboardService.getUpcomingAuctions();
      return response.data.data;
    },
  });

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Resumen general del sistema</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Subastas Totales
            </CardTitle>
            <Gavel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.overview.totalAuctions || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.overview.activeAuctions || 0} activas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ofertas Totales
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.overview.totalBids || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              En todas las subastas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Usuarios Activos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.overview.totalUsers || 0}
            </div>
            <p className="text-xs text-muted-foreground">Administradores</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Finalizando Pronto
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.overview.endingSoon || 0}
            </div>
            <p className="text-xs text-muted-foreground">Próximos 7 días</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Auctions */}
        <Card>
          <CardHeader>
            <CardTitle>Subastas Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentAuctions?.map((auction: any) => (
                <div
                  key={auction.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{auction.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(auction.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      auction.status === 'PUBLISHED'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {auction.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Auctions */}
        <Card>
          <CardHeader>
            <CardTitle>Próximas a Finalizar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAuctions?.map((auction: any) => (
                <div
                  key={auction.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex-1">
                    <p className="font-medium">{auction.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Finaliza: {formatDateTime(auction.endDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatCurrency(auction.currentPrice)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {auction._count.bids} ofertas
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {activity?.map((log: any) => (
              <div
                key={log.id}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {log.user?.name || 'Sistema'}
                  </span>
                  <span className="text-muted-foreground">{log.action}</span>
                  <span>{log.entity}</span>
                </div>
                <span className="text-muted-foreground">
                  {formatDateTime(log.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
