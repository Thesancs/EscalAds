
'use client';

import { LayoutDashboard, Tag, Globe2, User } from 'lucide-react';
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
import { useAuth } from '@/lib/auth-context';

const allMenuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Owner', 'Admin', 'Membro'] },
  { href: '/dashboard/offers', label: 'Ofertas Internas', icon: Tag, roles: ['Owner', 'Admin', 'Membro'] },
  { href: '/dashboard/monitored', label: 'Monitoradas', icon: Globe2, roles: ['Owner', 'Admin', 'Membro'] },
  { href: '/dashboard/perfil', label: 'Perfil', icon: User, roles: ['Owner', 'Admin', 'Membro'] },
];

interface SidebarNavProps {
    isMobile?: boolean;
}

export function SidebarNav({ isMobile = false }: SidebarNavProps) {
  const pathname = usePathname();
  const { role } = useAuth();

  const menuItems = React.useMemo(() => {
    if (!role) return [];
    return allMenuItems.filter(item => item.roles.includes(role));
  }, [role]);

  const isActive = React.useCallback(
    (href: string) => pathname === href || (href !== '/dashboard' && pathname.startsWith(href)),
    [pathname]
  );
  
  if (isMobile) {
    return (
        <nav className="flex-1 overflow-y-auto px-4 py-4">
            <ul className="space-y-2">
            {menuItems.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                <li key={item.href}>
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
                    <Icon className="h-5 w-5 mr-4" />
                    <span>{item.label}</span>
                    </Link>
                </li>
                );
            })}
            </ul>
        </nav>
    )
  }

  return (
    <TooltipProvider delayDuration={0}>
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Tooltip>
                  <TooltipTrigger asChild>
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
                      <Icon className="h-5 w-5 shrink-0" />
                      <span className="absolute left-14 opacity-0 transition-opacity duration-200 group-hover:relative group-hover:left-0 group-hover:ml-3 group-hover:opacity-100 whitespace-nowrap">
                        {item.label}
                      </span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" align="center" className="ml-2 group-hover:hidden">
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              </li>
            );
          })}
        </ul>
      </nav>
    </TooltipProvider>
  );
}
