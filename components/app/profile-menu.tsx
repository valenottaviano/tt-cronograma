'use client';

import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bandage, ChevronRight, CreditCard, DollarSign, Gift, HelpCircle, LogOut, Play, ShoppingBag,
  type LucideIcon,
} from 'lucide-react';
import { AbsencesSheetButton } from '@/components/absences-section';
import { forgetAppPath } from '@/components/back-to-app';
import { PaymentReminder } from '@/components/payment-reminder';
import { TTCCredencialDialog } from '@/components/tt-credencial-dialog';
import { cn } from '@/lib/utils';

interface RowProps extends ComponentPropsWithoutRef<'button'> {
  icon: LucideIcon;
  label: string;
  hint?: ReactNode;
}

/** Una fila del menú. forwardRef porque la usan de trigger los diálogos (`asChild`). */
const MenuRow = forwardRef<HTMLButtonElement, RowProps>(function MenuRow(
  { icon: Icon, label, hint, className, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        'flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-neutral-800/60',
        className,
      )}
      {...props}
    >
      <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
      <span className="flex-1 text-sm font-medium">{label}</span>
      {hint}
      <ChevronRight className="h-4 w-4 shrink-0 text-neutral-600" />
    </button>
  );
});

function LinkRow({ href, icon: Icon, label }: { href: string; icon: LucideIcon; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-neutral-800/60">
      <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
      <span className="flex-1 text-sm font-medium">{label}</span>
      <ChevronRight className="h-4 w-4 shrink-0 text-neutral-600" />
    </Link>
  );
}

function Group({ children }: { children: ReactNode }) {
  return (
    <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-neutral-900">
      {children}
    </div>
  );
}

interface Props {
  dni: string;
  payment: { year: number; month: number; monthLabel: string; paid: boolean } | null;
}

export function ProfileMenu({ dni, payment }: Props) {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/client/auth/logout', { method: 'POST' });
    forgetAppPath();
    router.push('/');
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <Group>
        <TTCCredencialDialog dni={dni} trigger={<MenuRow icon={CreditCard} label="Credencial TT" />} />
        {payment && (
          <PaymentReminder
            {...payment}
            trigger={
              <MenuRow
                icon={DollarSign}
                label="Cuota"
                hint={
                  payment.paid ? (
                    <span className="text-xs text-emerald-400">Al día</span>
                  ) : (
                    <span className="text-xs font-semibold text-amber-400">Pendiente</span>
                  )
                }
              />
            }
          />
        )}
        <AbsencesSheetButton trigger={<MenuRow icon={Bandage} label="Lesión, vacaciones o viaje" />} />
      </Group>

      <Group>
        <LinkRow href="/videos" icon={Play} label="Videos" />
        <LinkRow href="/faq?from=app" icon={HelpCircle} label="Preguntas frecuentes" />
        <LinkRow href="/benefits" icon={Gift} label="Beneficios" />
        <LinkRow href="/store" icon={ShoppingBag} label="Tienda" />
      </Group>

      <Group>
        <MenuRow icon={LogOut} label="Cerrar sesión" onClick={handleLogout} className="text-red-400" />
      </Group>
    </div>
  );
}
