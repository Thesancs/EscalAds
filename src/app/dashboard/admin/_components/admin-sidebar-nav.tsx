
'use client';

import {
  LayoutDashboard,
  Users,
  Banknote,
  BookCopy,
  ArrowLeft
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/lib/auth-context';
import type { OfferRole } from '@/lib/supabase/types';

interface AdminMenuItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: OfferRole[];
}

const adminMenuItems: AdminMenuItem[] = [
  { href: '/dashboard/admin', label: 'Controle Geral', icon: LayoutDashboard, roles: ['Owner', 'Admin'] },
  { href: '/dashboard/admin/financeiro', label: 'Financeiro', icon: Banknote, roles: ['Owner'] },
  { href: '/dashboard/admin/membros', label: 'Membros', icon: Users, roles: ['Owner', 'Admin'] },
  { href: '/dashboard/admin/catalogo', label: 'Catálogo', icon: BookCopy, roles: ['Owner', 'Admin'] },
];

interface AdminSidebarNavProps {
    isMobile?: boolean;
}

export function AdminSidebarNav({ isMobile = false }: AdminSidebarNavProps) {
  const pathname = usePathname();
  const { role } = useAuth();

  const items = React.useMemo(() => {
    if (!role || role === 'Membro') return [];
    return adminMenuItems.filter(item => item.roles.includes(role));
  }, [role]);

  const isActive = React.useCallback(
    (href: string) => pathname === href,
    [pathname]
  );

  const NavLink = ({ item, active }: { item: AdminMenuItem; active: boolean }) => (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex items-center justify-center h-10 w-10 rounded-lg text-sm font-medium',
        'text-muted-foreground hover:text-foreground hover:bg-white/5',
        'transition-all duration-200',
        active && 'bg-primary/20 text-primary ring-1 ring-primary/30',
        'group-hover:w-full group-hover:justify-start group-hover:px-4' 
      )}
    >
      <item.icon className="h-5 w-5 shrink-0" />
      <span className="absolute left-14 opacity-0 transition-opacity duration-200 group-hover:relative group-hover:left-0 group-hover:ml-3 group-hover:opacity-100 whitespace-nowrap">
        {item.label}
      </span>
    </Link>
  );

  const MobileNavLink = ({ item, active }: { item: AdminMenuItem; active: boolean }) => (
     <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex items-center h-12 w-full rounded-lg text-base font-medium',
        'text-muted-foreground hover:text-foreground hover:bg-white/5',
        'transition-colors duration-200',
        active && 'bg-primary/20 text-primary ring-1 ring-primary/30',
        'px-4'
      )}
    >
      <item.icon className="h-5 w-5 mr-4" />
      <span>{item.label}</span>
    </Link>
  );


  if (isMobile) {
    return (
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
            {items.map((item) => (
                <li key={item.href}>
                    <MobileNavLink item={item} active={isActive(item.href)} />
                </li>
            ))}
            <Separator className="my-4 bg-white/10" />
             <li>
                 <Link href="/dashboard" className="flex items-center h-12 w-full rounded-lg text-base font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 px-4">
                    <ArrowLeft className="h-5 w-5 mr-4" />
                    <span>Voltar ao Dashboard</span>
                </Link>
            </li>
        </nav>
    )
  }

  return (
    <TooltipProvider delayDuration={0}>
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-4">
        <ul className="space-y-2">
          {items.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <NavLink item={item} active={active} />
                  </TooltipTrigger>
                  <TooltipContent side="right" align="center" className="ml-2 group-hover:hidden">
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              </li>
            );
          })}
        </ul>
        <Separator className="my-4 bg-white/10" />
         <ul>
             <li>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Link
                            href="/dashboard"
                            className={cn(
                                'flex items-center justify-center h-10 w-10 rounded-lg text-sm font-medium',
                                'text-muted-foreground hover:text-foreground hover:bg-white/5',
                                'transition-all duration-200',
                                'group-hover:w-full group-hover:justify-start group-hover:px-4' 
                            )}
                            >
                            <ArrowLeft className="h-5 w-5 shrink-0" />
                            <span className="absolute left-14 opacity-0 transition-opacity duration-200 group-hover:relative group-hover:left-0 group-hover:ml-3 group-hover:opacity-100 whitespace-nowrap">
                                Voltar
                            </span>
                        </Link>
                    </TooltipTrigger>
                     <TooltipContent side="right" align="center" className="ml-2 group-hover:hidden">
                        <p>Voltar ao Dashboard</p>
                    </TooltipContent>
                </Tooltip>
             </li>
        </ul>
      </nav>
    </TooltipProvider>
  );
}
