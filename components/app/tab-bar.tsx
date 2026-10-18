'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
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
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl"
    >
      <ul className="mx-auto grid h-16 max-w-3xl grid-cols-4 px-2">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = href === activeHref;
          return (
            <li key={href} className="flex">
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-semibold',
                  'transition-[color,transform] duration-150 active:scale-90',
                  active ? 'text-brand-orange' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {active && (
                  // La pastilla viaja de una pestaña a otra en vez de aparecer de golpe.
                  <motion.span
                    layoutId="tab-pill"
                    className="absolute inset-x-2 inset-y-1.5 -z-10 rounded-2xl bg-brand-orange/10"
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  />
                )}
                <Icon className={cn('h-5 w-5 transition-transform duration-200', active && 'scale-110 stroke-[2.5]')} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
