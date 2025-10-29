'use client';

import { useMemo, useState } from 'react';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MoreVertical, Search, UserPlus } from 'lucide-react';
import type { AdminProfile } from '@/lib/supabase/types';

interface ProfilesTableClientProps {
  profiles: AdminProfile[];
}

const STATUS_BADGES: Record<string, string> = {
  ativo: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  trial: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  suspenso: 'bg-red-500/20 text-red-400 border-red-500/30',
};

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

function getStatusBadgeClasses(status: string) {
  return STATUS_BADGES[status] ?? 'bg-slate-500/20 text-slate-200 border-slate-400/30';
}

function formatLastSignIn(date: string | null) {
  if (!date) return 'Sem acessos registrados';
  return `Último acesso em ${new Date(date).toLocaleDateString('pt-BR')}`;
}

export function ProfilesTableClient({ profiles }: ProfilesTableClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  const filteredProfiles = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return profiles.filter((profile) => {
      const matchesQuery =
        !query ||
        (profile.full_name?.toLowerCase().includes(query) ?? false) ||
        (profile.email?.toLowerCase().includes(query) ?? false);
      const matchesStatus = statusFilter === 'todos' || profile.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [profiles, searchTerm, statusFilter]);

  return (
    <Card className="glassmorphic mt-4">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle>Perfis de Usuário</CardTitle>
            <CardDescription>
              Busque, filtre e gerencie os usuários da plataforma.
            </CardDescription>
          </div>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Convidar Usuário
          </Button>
        </div>
        <div className="flex flex-col md:flex-row gap-4 pt-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nome ou e-mail..."
              className="w-full pl-10"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="trial">Trial / pendente</SelectItem>
              <SelectItem value="suspenso">Suspenso</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead className="hidden lg:table-cell">Último acesso</TableHead>
              <TableHead className="hidden lg:table-cell">Tags</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProfiles.map((profile) => (
              <TableRow key={profile.id} className="hover:bg-muted/10">
                <TableCell>
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={profile.avatar_url ?? undefined} data-ai-hint="person avatar" />
                      <AvatarFallback>
                        {getInitials(profile.full_name ?? profile.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{profile.full_name ?? 'Sem nome'}</div>
                      <div className="text-sm text-muted-foreground">{profile.email ?? '—'}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={`text-xs capitalize ${getStatusBadgeClasses(profile.status)}`}>
                    {profile.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(profile.role)}>{profile.role}</Badge>
                </TableCell>
                <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                  {formatLastSignIn(profile.last_sign_in_at)}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {profile.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {profile.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
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
                      <DropdownMenuItem>Editar perfil</DropdownMenuItem>
                      <DropdownMenuItem>Alterar cargo</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredProfiles.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-2xl font-bold">Nenhum usuário encontrado</h3>
            <p className="text-muted-foreground mt-2">
              Tente ajustar os filtros ou o termo de busca.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
