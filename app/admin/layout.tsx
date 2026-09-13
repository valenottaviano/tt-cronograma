'use client';

/**
 * Shell del `/admin` heredado.
 *
 * Ya no administra nada: las cinco secciones (beneficios, carreras, tracks,
 * productos, pedidos) se migraron al panel del coach y acá quedaron carteles que
 * apuntan ahí. Por eso también se retiró la autenticación con Firebase — no hay
 * nada que proteger, y era el último uso de Firebase Auth en el repo.
 *
 * Se mantiene la navegación para que quien tenga una URL guardada entienda a
 * dónde se mudó cada cosa, en vez de encontrarse un 404.
 *
 * Ver roberto-parodi/docs/CONTENIDO_WEB.md.
 */
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Menu, Home, Package, ShoppingCart, Settings, Calendar, MapPin, ExternalLink,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const PANEL_URL = process.env.NEXT_PUBLIC_COACH_PANEL_URL ?? 'https://plan.grupott.com.ar';

const navItems = [
  { href: '/admin', label: 'Inicio', icon: Home },
  { href: '/admin/products', label: 'Productos', icon: Package },
  { href: '/admin/orders', label: 'Pedidos', icon: ShoppingCart },
  { href: '/admin/races', label: 'Carreras', icon: Calendar },
  { href: '/admin/benefits', label: 'Beneficios', icon: Settings },
  { href: '/admin/tracks', label: 'Tracks GPX', icon: MapPin },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname?.startsWith(href);

  const nav = (
    <nav className="space-y-1">
      {navItems.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={() => setOpen(false)}
          className={cn(
            'flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors',
            isActive(href) ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5 hover:text-white'
          )}
        >
          <Icon className="h-4 w-4 shrink-0" />
          {label}
        </Link>
      ))}
      <a
        href={`${PANEL_URL}/web/races`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex items-center gap-3 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/5"
      >
        <ExternalLink className="h-4 w-4 shrink-0" />
        Ir al panel del coach
      </a>
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <header className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="rounded-xl p-2 hover:bg-white/5" aria-label="Abrir menú">
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-72 border-white/10 bg-[#050505] p-4 text-white">
            <p className="mb-6 text-xs font-bold uppercase tracking-[0.2em] text-white/40">Admin TT</p>
            {nav}
          </SheetContent>
        </Sheet>
        <p className="text-sm font-bold uppercase italic tracking-tighter">Admin TT</p>
      </header>

      <div className="flex">
        <aside className="hidden w-72 shrink-0 border-r border-white/10 p-4 lg:block">
          <p className="mb-6 px-4 text-xs font-bold uppercase tracking-[0.2em] text-white/40">Admin TT</p>
          {nav}
        </aside>
        <main className="min-w-0 flex-1 px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
