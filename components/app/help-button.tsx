'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarClock, ChevronRight, MessageCircle, MessageCircleQuestion } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { helpWhatsappUrl } from '@/lib/help-contact';

/**
 * El botón flotante de «¿Ayuda?», abajo a la derecha sobre la barra de
 * pestañas: lleva al WhatsApp del equipo o a sacar turno en la oficina.
 */
export function HelpButton() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // En la pantalla de turnos ya está donde lo llevaría.
  if (pathname?.startsWith('/turnos')) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed right-4 bottom-[calc(4rem+env(safe-area-inset-bottom)+0.75rem)] z-30 flex h-11 items-center gap-1.5 rounded-full bg-brand-orange pl-3 pr-4 text-sm font-bold text-white shadow-[0_6px_24px_rgba(237,36,31,0.45)] transition-transform active:scale-95"
      >
        <MessageCircleQuestion className="h-5 w-5" />
        ¿Ayuda?
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl border-border bg-neutral-950 px-0 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
          <SheetHeader className="px-5">
            <SheetTitle>¿Necesitás ayuda?</SheetTitle>
            <SheetDescription>Escribinos o vení a vernos a la oficina.</SheetDescription>
          </SheetHeader>
          <div className="space-y-2 px-4">
            <a
              href={helpWhatsappUrl('¡Hola! Necesito ayuda con ')}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-2xl border border-border bg-neutral-900 px-4 py-3.5 transition-colors hover:bg-neutral-800"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                <MessageCircle className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">Escribinos por WhatsApp</span>
                <span className="block text-xs text-muted-foreground">Consultas, la app, tu cuota</span>
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </a>
            <Link
              href="/turnos"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-2xl border border-border bg-neutral-900 px-4 py-3.5 transition-colors hover:bg-neutral-800"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-orange/15 text-brand-orange">
                <CalendarClock className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">Sacar turno en la oficina</span>
                <span className="block text-xs text-muted-foreground">Una visita o una consultoría técnica</span>
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
