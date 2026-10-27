'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CalendarCheck, CalendarX, Loader2, MessageCircle, X } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import type { Appointment, AppointmentSlot, AppointmentsData } from '@/lib/coachApi';
import { helpWhatsappUrl } from '@/lib/help-contact';
import { cn } from '@/lib/utils';

/** Las horas se muestran siempre en hora de Argentina, aunque el celular esté en otra zona. */
const TZ = 'America/Argentina/Buenos_Aires';
/** Tope del motivo en la API del panel. */
const REASON_MAX = 280;

const dayKeyFmt = new Intl.DateTimeFormat('en-CA', { timeZone: TZ });
const timeFmt = new Intl.DateTimeFormat('es-AR', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false });
const weekdayFmt = new Intl.DateTimeFormat('es-AR', { timeZone: TZ, weekday: 'short' });
const dayNumFmt = new Intl.DateTimeFormat('es-AR', { timeZone: TZ, day: 'numeric' });
const longDayFmt = new Intl.DateTimeFormat('es-AR', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long' });

const time = (iso: string) => timeFmt.format(new Date(iso));
/** «Martes, 27 de octubre»: sólo la primera en mayúscula (con `capitalize` quedaría «De Octubre»). */
const longDay = (iso: string) => {
  const s = longDayFmt.format(new Date(iso));
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export function BackButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      aria-label="Cerrar"
      onClick={() => (window.history.length > 1 ? router.back() : router.push('/inicio'))}
      className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
    >
      <X className="h-5 w-5" />
    </button>
  );
}

export function OfficeBooking({ initial }: { initial: AppointmentsData | null }) {
  const router = useRouter();
  const [slots, setSlots] = useState<AppointmentSlot[]>(initial?.slots ?? []);
  const [mine, setMine] = useState<Appointment[]>(initial?.mine ?? []);
  const cancelNotice = initial?.cancelNoticeMinutes ?? 120;

  const days = useMemo(() => {
    const groups = new Map<string, AppointmentSlot[]>();
    for (const s of slots) {
      const k = dayKeyFmt.format(new Date(s.startsAt));
      groups.set(k, [...(groups.get(k) ?? []), s]);
    }
    return [...groups.entries()];
  }, [slots]);

  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const activeDay = days.find(([k]) => k === selectedDay) ?? days[0];

  const [picked, setPicked] = useState<AppointmentSlot | null>(null);
  const [reason, setReason] = useState('');
  const [booking, setBooking] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  async function reload() {
    const res = await fetch('/api/client/appointments');
    if (res.status === 401) return router.push('/');
    const json = await res.json().catch(() => ({}));
    if (res.ok && json.data) {
      setSlots(json.data.slots);
      setMine(json.data.mine);
    }
  }

  async function book() {
    if (!picked || booking || !reason.trim()) return;
    setBooking(true);
    try {
      const res = await fetch('/api/client/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startsAt: picked.startsAt, reason: reason.trim() }),
      });
      if (res.status === 401) return router.push('/');
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(json.error ?? 'No se pudo sacar el turno. Probá de nuevo.');
        // Si se lo ganó otro, que vea los horarios como están ahora.
        if (res.status === 409) await reload();
        setPicked(null);
        return;
      }
      setMine([json.data]);
      setSlots((prev) => prev.filter((s) => s.startsAt !== picked.startsAt));
      setPicked(null);
      setReason('');
      toast.success('¡Listo! Te esperamos.');
    } catch {
      toast.error('No se pudo sacar el turno. Revisá tu conexión.');
    } finally {
      setBooking(false);
    }
  }

  async function cancel(id: string) {
    if (cancelling) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/client/appointments/${id}`, { method: 'DELETE' });
      if (res.status === 401) return router.push('/');
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        toast.error(json.error ?? 'No se pudo cancelar el turno.');
        return;
      }
      toast.success('Cancelaste el turno.');
      await reload();
    } catch {
      toast.error('No se pudo cancelar el turno. Revisá tu conexión.');
    } finally {
      setCancelling(false);
    }
  }

  if (!initial) {
    return (
      <Empty
        title="No pudimos cargar los turnos"
        text="Probá de nuevo en un rato o escribinos por WhatsApp."
      />
    );
  }

  const current = mine[0];
  if (current) {
    const canCancel = new Date(current.startsAt).getTime() - Date.now() >= cancelNotice * 60 * 1000;
    return (
      <section className="space-y-4">
        <div className="rounded-3xl border border-brand-orange/40 bg-brand-orange/5 p-5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-orange">
            <CalendarCheck className="h-4 w-4" /> Tu turno
          </div>
          <p className="mt-3 text-2xl font-black">{longDay(current.startsAt)}</p>
          <p className="text-lg font-semibold tabular-nums">
            {time(current.startsAt)} a {time(current.endsAt)} h
          </p>
          <p className="mt-2 text-sm text-muted-foreground">«{current.reason}»</p>
        </div>
        {canCancel ? (
          <button
            type="button"
            onClick={() => cancel(current.id)}
            disabled={cancelling}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-neutral-800 py-3 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground disabled:opacity-60"
          >
            {cancelling && <Loader2 className="h-4 w-4 animate-spin" />} Cancelar turno
          </button>
        ) : (
          <WhatsappLink text={`¡Hola! No voy a poder ir a mi turno de las ${time(current.startsAt)}.`}>
            ¿No podés ir? Avisanos por WhatsApp
          </WhatsappLink>
        )}
      </section>
    );
  }

  if (!activeDay) {
    return (
      <Empty
        title="No hay turnos disponibles"
        text="Por ahora no quedan horarios libres. Escribinos y lo coordinamos."
      />
    );
  }

  return (
    <section className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Elegí el día y el horario para venir a la oficina: una visita o una consultoría técnica con tus entrenadores.
      </p>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
        {days.map(([k, daySlots]) => {
          const active = k === activeDay[0];
          const d = new Date(daySlots[0].startsAt);
          return (
            <button
              key={k}
              type="button"
              onClick={() => setSelectedDay(k)}
              className={cn(
                'flex w-14 shrink-0 flex-col items-center rounded-2xl border py-2 transition-colors',
                active ? 'border-brand-orange bg-brand-orange/10 text-foreground' : 'border-border bg-neutral-900 text-muted-foreground',
              )}
            >
              <span className="text-[11px] font-bold uppercase">{weekdayFmt.format(d).replace('.', '')}</span>
              <span className="text-xl font-black">{dayNumFmt.format(d)}</span>
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold">{longDay(activeDay[1][0].startsAt)}</h2>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {activeDay[1].map((s) => (
            <button
              key={s.startsAt}
              type="button"
              onClick={() => setPicked(s)}
              className="rounded-xl border border-border bg-neutral-900 py-3 text-sm font-bold tabular-nums transition-colors hover:border-brand-orange active:scale-95"
            >
              {time(s.startsAt)}
            </button>
          ))}
        </div>
      </div>

      <Sheet open={picked !== null} onOpenChange={(open) => !open && setPicked(null)}>
        <SheetContent side="bottom" className="rounded-t-3xl border-border bg-neutral-950 px-0 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
          {picked && (
            <>
              <SheetHeader className="px-5">
                <SheetTitle>{longDay(picked.startsAt)}</SheetTitle>
                <SheetDescription>
                  De {time(picked.startsAt)} a {time(picked.endsAt)} h
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-4 px-5">
                <div className="space-y-2">
                  <label htmlFor="appointment-reason" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Motivo
                  </label>
                  <Textarea
                    id="appointment-reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value.slice(0, REASON_MAX))}
                    placeholder="¿Sobre qué querés hablar? Ej: revisar mi técnica de carrera, armar el plan para una carrera…"
                    rows={4}
                    className="bg-neutral-900"
                  />
                </div>
                <button
                  type="button"
                  onClick={book}
                  disabled={booking || !reason.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-orange py-3.5 text-sm font-bold text-white disabled:opacity-60"
                >
                  {booking && <Loader2 className="h-4 w-4 animate-spin" />} Confirmar turno
                </button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </section>
  );
}

function Empty({ title, text }: { title: string; text: string }) {
  return (
    <div className="space-y-4 rounded-3xl border border-border bg-neutral-900 p-6 text-center">
      <CalendarX className="mx-auto h-8 w-8 text-muted-foreground" />
      <div>
        <p className="font-semibold">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{text}</p>
      </div>
      <WhatsappLink text="¡Hola! Quiero sacar un turno en la oficina.">Escribinos por WhatsApp</WhatsappLink>
    </div>
  );
}

function WhatsappLink({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <a
      href={helpWhatsappUrl(text)}
      target="_blank"
      rel="noopener noreferrer"
      className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 py-3 text-sm font-bold text-white"
    >
      <MessageCircle className="h-4 w-4" /> {children}
    </a>
  );
}
