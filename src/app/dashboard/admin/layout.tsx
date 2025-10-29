
'use client';

import { type PropsWithChildren, useState, useEffect } from "react";
import { AppHeader } from "@/app/dashboard/_components/header";
import { useAuth } from '@/lib/auth-context';
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { AdminSidebarNav } from "./_components/admin-sidebar-nav";
import { MobileSidebar } from "@/app/dashboard/_components/mobile-sidebar";


export default function AdminLayout({ children }: PropsWithChildren) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, loading, role } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isFinanceRoute = pathname.startsWith('/dashboard/admin/financeiro');

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else if (role === 'Membro') {
        router.replace('/dashboard');
      } else if (role === 'Admin' && isFinanceRoute) {
        router.replace('/dashboard/admin');
      }
    }
  }, [user, loading, role, router, isFinanceRoute]);

  if (loading || !user || role === 'Membro' || (role === 'Admin' && isFinanceRoute)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <aside
        className={cn(
          'hidden md:fixed md:inset-y-0 md:left-0 md:z-20 md:flex md:flex-col',
          'w-16 hover:w-72 transition-[width] duration-300 ease-in-out',
          'glassmorphic border-r border-white/10 group'
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 shrink-0 items-center justify-center">
            <Link href="/dashboard" className="flex items-center justify-center h-full w-full">
              <div className="opacity-0 w-40 group-hover:opacity-100 transition-opacity duration-200 ease-in-out">
                <Image
                    src="/Logo Scalify.png"
                    alt="Scalify Logo"
                    width={60}
                    height={40}
                    priority
                  />
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 opacity-100 group-hover:opacity-0 transition-opacity duration-200">
                <Image
                    src="/Logo Scalify.png"
                    alt="Scalify Logo Recolhido"
                    width={32}
                    height={32}
                  />
              </div>
            </Link>
          </div>
          <AdminSidebarNav />
        </div>
      </aside>
      
      <MobileSidebar 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
      
      <div className="flex-1 flex flex-col md:ml-16">
        <AppHeader onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 p-4 lg:p-6 opacity-0 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
