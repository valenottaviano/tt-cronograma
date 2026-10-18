'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, Flag, Home, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS = [
  { href: '/inicio', label: 'Inicio', icon: Home },
  { href: '/entrenamiento', label: 'Entrenamiento', icon: CalendarDays },
  { href: '/mis-carreras', label: 'Carreras', icon: Flag },
  { href: '/perfil', label: 'Perfil', icon: User },
] as const;

/** La barra de pestañas de abajo. Videos cuelga de Perfil, así que lo marca como activo. */
export function TabBar() {
  const pathname = usePathname();
  const activeHref = pathname?.startsWith('/videos')
    ? '/perfil'
    : TABS.find((t) => pathname === t.href || pathname?.startsWith(`${t.href}/`))?.href;

  return (
    <nav
      aria-label="Secciones"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <ul className="mx-auto grid h-16 max-w-3xl grid-cols-4">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = href === activeHref;
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex h-full flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors',
                  active ? 'text-brand-orange' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className={cn('h-5 w-5', active && 'stroke-[2.5]')} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
