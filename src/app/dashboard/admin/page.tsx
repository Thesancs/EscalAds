
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MoreVertical, UserPlus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { fetchAdminProfiles } from '@/lib/supabase/queries';

function getInitials(value: string | null | undefined) {
  if (!value) return 'US';
  return value
    .split(' ')
    .filter(Boolean)
    .map((segment) => segment[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

function getRoleBadgeVariant(role: string) {
  switch (role) {
    case 'Owner':
      return 'default';
    case 'Admin':
      return 'secondary';
    case 'Membro':
      return 'outline';
    default:
      return 'secondary';
  }
}

function getStatusDescription(status: string, lastSignIn: string | null) {
  switch (status) {
    case 'ativo':
      return lastSignIn
        ? `Ativo — último acesso em ${new Date(lastSignIn).toLocaleDateString('pt-BR')}`
        : 'Ativo — aguardando primeiro acesso';
    case 'suspenso':
      return 'Suspenso via painel do Supabase';
    default:
      return 'Em avaliação / aguardando confirmação de e-mail';
  }
}

async function loadAdminProfiles() {
  try {
    const profiles = await fetchAdminProfiles();
    return { profiles };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Não foi possível carregar os membros cadastrados.';
    return { profiles: [], error: message };
  }
}

export default async function AdminDashboardPage() {
  const { profiles, error } = await loadAdminProfiles();
  const highlighted = profiles.slice(0, 5);

  return (
    <div className="container mx-auto max-w-7xl py-8 animate-fade-in">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Painel de Administração</h1>
          <p className="text-muted-foreground">
            Gerencie usuários, permissões e outras configurações do sistema.
          </p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Adicionar Usuário
        </Button>
      </div>

      {error ? (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle>Supabase não configurado</CardTitle>
            <CardDescription>
              {error}. Verifique as variáveis de ambiente <code>SUPABASE_URL</code> e
              {' '}
              <code>SUPABASE_SERVICE_ROLE_KEY</code>.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card className="glassmorphic">
          <CardHeader>
            <CardTitle>Gerenciamento de Usuários</CardTitle>
            <CardDescription>
              Atualmente, existem {profiles.length} usuários na plataforma.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {highlighted.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/10">
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage
                            src={user.avatar_url ?? undefined}
                            data-ai-hint="person avatar"
                          />
                          <AvatarFallback>{getInitials(user.full_name ?? user.email)}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <span className="font-medium">{user.full_name ?? 'Sem nome'}</span>
                          <p className="text-xs text-muted-foreground">
                            {getStatusDescription(user.status, user.last_sign_in_at)}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.email ?? '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.status === 'ativo' ? 'default' : user.status === 'suspenso' ? 'destructive' : 'secondary'}
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                          <DropdownMenuItem>Alterar Cargo</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-400 focus:text-red-500">
                            Suspender
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {profiles.length > highlighted.length && (
              <p className="pt-4 text-sm text-muted-foreground">
                Exibindo {highlighted.length} de {profiles.length} membros. Consulte a aba
                {' "Perfis" '}para ver a lista completa e aplicar filtros.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
