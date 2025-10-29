
'use client';

import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet';
import Link from 'next/link';
import Image from 'next/image';
import { SidebarNav } from './_components/sidebar-nav';
import { usePathname } from 'next/navigation';
import { AdminSidebarNav } from './admin/_components/admin-sidebar-nav';

interface MobileSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const pathname = usePathname();
  const isAdminPath = pathname.startsWith('/dashboard/admin');

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="p-0 w-72 glassmorphic border-r border-white/10">
        <div className="flex h-full flex-col">
          <div className="flex h-16 shrink-0 items-center justify-center px-6">
            <Link href="/dashboard" className="flex items-center" onClick={onClose}>
              <Image
                src="/Logo Scalify.png"
                alt="Scalify Logo"
                width={60}
                height={20}
                priority
              />
            </Link>
          </div>

          <div onClick={onClose}>
            {isAdminPath ? <AdminSidebarNav isMobile /> : <SidebarNav isMobile />}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
