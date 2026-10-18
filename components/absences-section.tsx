"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ABSENCE_DURATIONS, type Absence, type AbsenceType } from "@/lib/coachApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";
import { addDays, format, parseISO, subDays } from "date-fns";
import { es } from "date-fns/locale";
import { Bandage, Loader2, Plane, TreePalm, type LucideIcon } from "lucide-react";

/** Tope de la nota en la API del panel. */
const NOTE_MAX = 140;
/** Mismos márgenes que valida el panel: para atrás (se lesionó el finde) y para adelante. */
const MAX_DAYS_BACK = 14;
const MAX_DAYS_AHEAD = 60;

const TYPES: {
  value: AbsenceType;
  label: string;
  icon: LucideIcon;
  placeholder: string;
  endLabel: string;
}[] = [
  { value: "INJURY", label: "Lesión", icon: Bandage, placeholder: "Ej: dolor en la rodilla derecha", endLabel: "Ya estoy bien" },
  { value: "VACATION", label: "Vacaciones", icon: TreePalm, placeholder: "Ej: me voy a la costa", endLabel: "Volví antes" },
  { value: "TRAVEL", label: "Viaje", icon: Plane, placeholder: "Ej: viaje de trabajo, puedo correr suelto", endLabel: "Volví antes" },
];
const TYPE_BY_VALUE = Object.fromEntries(TYPES.map((t) => [t.value, t])) as Record<AbsenceType, (typeof TYPES)[number]>;

/** Las fechas vienen a medianoche UTC: se toma sólo el día para no correrlas por la zona horaria. */
function day(iso: string): Date {
  return parseISO(iso.slice(0, 10));
}

/** «del 14 al 20 de octubre». `endDate` es el día en que vuelve, por eso el −1. */
function range(a: Absence): string {
  const start = day(a.startDate);
  const last = subDays(day(a.endDate), 1);
  const sameMonth = start.getMonth() === last.getMonth();
  return `del ${format(start, sameMonth ? "d" : "d 'de' MMMM", { locale: es })} al ${format(last, "d 'de' MMMM", { locale: es })}`;
}

export function AbsencesSection() {
  const router = useRouter();
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const today = new Date();
  const [type, setType] = useState<AbsenceType>("INJURY");
  const [startDate, setStartDate] = useState(format(today, "yyyy-MM-dd"));
  const [days, setDays] = useState<number>(ABSENCE_DURATIONS[0]);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [ending, setEnding] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/client/absences")
      .then(async (res) => {
        if (res.status === 401) {
          router.push("/");
          return;
        }
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.error ?? "Error inesperado");
        setAbsences(json.data ?? []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [router]);

  const alreadyOpen = absences.some((a) => a.type === type);

  async function submit() {
    if (saving || alreadyOpen) return;
    setSaving(true);
    try {
      const res = await fetch("/api/client/absences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, startDate, days, note: note.trim() || null }),
      });
      if (res.status === 401) {
        router.push("/");
        return;
      }
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "No pudimos guardar. Probá de nuevo.");
      setAbsences((prev) => [...prev, json.data].sort((a, b) => a.startDate.localeCompare(b.startDate)));
      setNote("");
      toast.success("Listo, el coach ya lo puede ver");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No pudimos guardar. Probá de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  async function end(a: Absence) {
    if (ending) return;
    setEnding(a.id);
    try {
      const res = await fetch(`/api/client/absences/${a.id}`, { method: "DELETE" });
      if (res.status === 401) {
        router.push("/");
        return;
      }
      if (!res.ok && res.status !== 204) throw new Error();
      setAbsences((prev) => prev.filter((x) => x.id !== a.id));
      toast.success("Actualizado");
    } catch {
      toast.error("No pudimos actualizarlo. Probá de nuevo.");
    } finally {
      setEnding(null);
    }
  }

  const selected = TYPE_BY_VALUE[type];
  const returnDay = addDays(parseISO(startDate), days);

  return (
    <div className="flex flex-col gap-6 px-4 pb-6">
      <p className="text-sm text-muted-foreground leading-relaxed">
        Si estás lesionado, te vas de vacaciones o viajás, avisalo acá. El coach lo ve cuando arma tu
        planilla y no depende de que se acuerde del chat.
      </p>

      {/* Avisos activos */}
      {loading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <p className="text-sm text-destructive text-center">{error}</p>
      ) : absences.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tus avisos</p>
          {absences.map((a) => {
            const t = TYPE_BY_VALUE[a.type];
            const Icon = t.icon;
            const started = day(a.startDate) <= today;
            return (
              <div key={a.id} className="rounded-xl border border-red-600/40 bg-red-600/5 px-4 py-3 flex items-center gap-3">
                <Icon className="w-4 h-4 text-red-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white leading-tight">
                    {t.label}
                    {a.description !== t.label && (
                      <span className="font-normal text-muted-foreground"> · {a.description}</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{range(a)}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={ending === a.id}
                  onClick={() => end(a)}
                  className="h-8 text-xs shrink-0 border-red-600/50 text-red-500 hover:bg-red-600/10 hover:text-red-400"
                >
                  {ending === a.id ? <Loader2 className="w-3 h-3 animate-spin" /> : started ? t.endLabel : "Cancelar"}
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Nuevo aviso */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="flex flex-col gap-4"
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Nuevo aviso</p>

        <div className="grid grid-cols-3 gap-2">
          {TYPES.map((t) => {
            const Icon = t.icon;
            const active = type === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value)}
                className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 text-xs font-medium transition-colors ${
                  active ? "border-red-600 bg-red-600/10 text-white" : "border-border bg-neutral-900 text-muted-foreground"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-red-500" : ""}`} />
                {t.label}
              </button>
            );
          })}
        </div>

        {alreadyOpen ? (
          <p className="text-sm text-muted-foreground">
            Ya tenés un aviso de {selected.label.toLowerCase()} activo. Si cambió algo, cerralo arriba y cargá uno nuevo.
          </p>
        ) : (
          <>
            <div>
              <Label htmlFor="absence-start">¿Desde cuándo?</Label>
              <Input
                id="absence-start"
                type="date"
                value={startDate}
                min={format(subDays(today, MAX_DAYS_BACK), "yyyy-MM-dd")}
                max={format(addDays(today, MAX_DAYS_AHEAD), "yyyy-MM-dd")}
                onChange={(e) => e.target.value && setStartDate(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label>¿Por cuánto tiempo?</Label>
              <div className="grid grid-cols-4 gap-2 mt-1">
                {ABSENCE_DURATIONS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDays(d)}
                    className={`rounded-lg border h-10 text-sm font-medium transition-colors ${
                      days === d ? "border-red-600 bg-red-600/10 text-white" : "border-border bg-neutral-900 text-muted-foreground"
                    }`}
                  >
                    {d} días
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                Volvés el {format(returnDay, "EEEE d 'de' MMMM", { locale: es })}. Si se alarga, avisá de nuevo.
              </p>
            </div>

            <div>
              <Label htmlFor="absence-note">Nota (opcional)</Label>
              <Input
                id="absence-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={NOTE_MAX}
                placeholder={selected.placeholder}
                className="mt-1"
              />
            </div>

            <Button type="submit" disabled={saving} className="h-11 bg-red-600 hover:bg-red-700 text-white border-0 font-semibold">
              {saving && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
              Avisar al coach
            </Button>
          </>
        )}
      </form>
    </div>
  );
}

/** El botón de la planilla que abre la sección. Mismo patrón que «Mis Carreras». */
export function AbsencesSheetButton({ className, trigger }: { className?: string; trigger?: React.ReactNode }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger ?? (
          <Button variant="outline" className={`gap-2 ${className ?? ""}`}>
            <Bandage className="w-4 h-4" />
            Lesión, vacaciones o viaje
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>Avisar al coach</SheetTitle>
        </SheetHeader>
        <AbsencesSection />
      </SheetContent>
    </Sheet>
  );
}
