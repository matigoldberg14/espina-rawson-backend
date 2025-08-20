import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { useAuth } from '../contexts/AuthContext';

export default function UsersPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Usuarios</h1>
        <p className="text-muted-foreground">Gestión de usuarios del sistema</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuario Actual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <span className="font-medium">Nombre:</span> {user?.name}
            </div>
            <div>
              <span className="font-medium">Email:</span> {user?.email}
            </div>
            <div>
              <span className="font-medium">Rol:</span> {user?.role}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center py-8">
            La gestión completa de usuarios estará disponible próximamente.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
