
'use client';

import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {LogOut, UserRound, LayoutDashboard} from 'lucide-react';

import {Avatar, AvatarFallback} from '@/components/ui/avatar';
import {Button} from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {useAuth} from '@/lib/auth-context';

function getInitials(name: string | null | undefined) {
  if (!name) {
    return 'ES';
  }
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function AppHeader() {
  const router = useRouter();
  const {user, logout} = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-gradient-to-r from-neutral-950 via-neutral-950/95 to-neutral-950/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <LayoutDashboard className="h-5 w-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-wide text-primary">EscalAds</span>
            <span className="text-xs text-muted-foreground">inteligência de criativos ativos</span>
          </div>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-11 gap-2 px-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getInitials(user?.fullName)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left sm:flex sm:flex-col">
                <span className="text-sm font-medium leading-tight">{user?.fullName ?? 'Operador'}</span>
                <span className="text-xs text-muted-foreground">{user?.email}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-neutral-950/95 text-foreground backdrop-blur">
            <DropdownMenuLabel className="flex flex-col">
              <span className="text-sm font-semibold">{user?.fullName ?? 'Operador'}</span>
              <span className="text-xs text-muted-foreground uppercase">{user?.role ?? 'MEMBER'}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2">
              <UserRound className="h-4 w-4" />
              <span>Perfil & Preferências</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="gap-2 text-red-500 focus:text-red-500">
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
