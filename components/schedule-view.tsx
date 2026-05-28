"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Schedule, Day } from "@/lib/coachApi";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  LogOut,
  Map,
  Moon,
  User,
} from "lucide-react";
import { format, addDays, parseISO } from "date-fns";
import { es } from "date-fns/locale";

const DAY_NAMES_SHORT = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const DAY_NAMES_FULL = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

interface Props {
  schedules: Schedule[];
  athleteName: string;
  dni: string;
}

export function ScheduleView({ schedules, athleteName, dni }: Props) {
  const router = useRouter();
  const [weekIndex, setWeekIndex] = useState(() => findCurrentWeekIndex(schedules));

  async function handleLogout() {
    await fetch("/api/client/auth/logout", { method: "POST" });
    router.push("/");
  }

  if (schedules.length === 0) {
    return (
      <div className="min-h-dvh bg-background flex flex-col items-center justify-center gap-6 px-4">
        <img src="/logo-tt.png" alt="TT" className="h-16 w-auto" />
        <h1 className="text-2xl font-bold text-center">Hola, {athleteName}</h1>
        <p className="text-muted-foreground text-center max-w-sm">
          Tu entrenador aún no publicó ninguna planilla. Volvé pronto.
        </p>
        <Button variant="outline" onClick={handleLogout} className="gap-2 min-h-[44px]">
          <LogOut className="w-4 h-4" /> Salir
        </Button>
      </div>
    );
  }

  const schedule = schedules[weekIndex];
  const startDate = parseISO(schedule.period.startDate);
  const isBiweekly = schedule.period.type === "BIWEEKLY";
  const totalDays = isBiweekly ? 14 : 7;

  const dayMap: Record<number, Day> = {};
  schedule.days.forEach((d) => { dayMap[d.dayIndex] = d; });

  const weeks = isBiweekly
    ? [Array.from({ length: 7 }, (_, i) => i), Array.from({ length: 7 }, (_, i) => i + 7)]
    : [Array.from({ length: 7 }, (_, i) => i)];

  const endDate = addDays(startDate, totalDays - 1);

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      {/* ── Header ── */}
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-10 safe-area-top">
        <div className="px-4 h-14 flex items-center justify-between max-w-3xl mx-auto w-full">
          <div className="flex items-center gap-2.5 min-w-0">
            <img src="/logo-tt.png" alt="TT" className="h-7 w-auto shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground leading-none">Planilla</p>
              <p className="font-semibold text-sm leading-tight truncate">{athleteName}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => router.push(`/schedule/${dni}/profile`)}
            >
              <User className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* ── Week navigator ── */}
      <div className="border-b border-border bg-neutral-950">
        <div className="px-4 py-3 flex items-center justify-between gap-3 max-w-3xl mx-auto w-full">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => setWeekIndex((i) => i - 1)}
            disabled={weekIndex === 0}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="text-center min-w-0">
            <p className="font-semibold text-sm">
              {format(startDate, "d MMM", { locale: es })} — {format(endDate, "d MMM yyyy", { locale: es })}
            </p>
            {isBiweekly && (
              <p className="text-[11px] text-muted-foreground">Semana quincenal</p>
            )}
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => setWeekIndex((i) => i + 1)}
            disabled={weekIndex === schedules.length - 1}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* ── Main content ── */}
      <main className="flex-1 px-4 py-4 max-w-3xl mx-auto w-full space-y-4 pb-8">
        {/* Coach note */}
        {schedule.coachNoteExternal && (
          <div className="rounded-xl bg-brand-orange/10 border border-brand-orange/30 px-4 py-3">
            <p className="text-xs font-semibold text-brand-orange mb-1 uppercase tracking-wide">
              Nota del entrenador
            </p>
            <p className="text-sm leading-relaxed">{schedule.coachNoteExternal}</p>
          </div>
        )}

        {/* Week(s) */}
        {weeks.map((dayIndices, weekNum) => (
          <div key={weekNum} className="space-y-2">
            {isBiweekly && (
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-1">
                Semana {weekNum + 1}
              </p>
            )}

            {/* Mobile: vertical list | Desktop: 7-col grid */}
            <div className="flex flex-col gap-2 md:hidden">
              {dayIndices.map((dayIndex) => (
                <MobileDayCard
                  key={dayIndex}
                  dayIndex={dayIndex}
                  date={addDays(startDate, dayIndex)}
                  day={dayMap[dayIndex]}
                />
              ))}
            </div>

            <div className="hidden md:grid md:grid-cols-7 gap-2">
              {dayIndices.map((dayIndex) => (
                <DesktopDayCard
                  key={dayIndex}
                  dayIndex={dayIndex}
                  date={addDays(startDate, dayIndex)}
                  day={dayMap[dayIndex]}
                />
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}

// ── Mobile card (full-width row) ──────────────────────────────────────────────

function MobileDayCard({ dayIndex, date, day }: { dayIndex: number; date: Date; day: Day | undefined }) {
  const isRest = !day || day.isRest;
  const isToday = format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

  return (
    <div
      className={`rounded-2xl border flex items-stretch overflow-hidden transition-colors ${
        isToday ? "border-brand-orange" : "border-border"
      } ${isRest ? "bg-neutral-950/60" : "bg-neutral-900"}`}
    >
      {/* Day label strip */}
      <div
        className={`flex flex-col items-center justify-center px-3 py-3 shrink-0 min-w-[56px] ${
          isToday ? "bg-brand-orange/15" : "bg-neutral-800/50"
        }`}
      >
        <span
          className={`text-[10px] font-bold uppercase tracking-widest ${
            isToday ? "text-brand-orange" : "text-muted-foreground"
          }`}
        >
          {DAY_NAMES_SHORT[dayIndex % 7]}
        </span>
        <span
          className={`text-xl font-bold leading-tight ${
            isToday ? "text-brand-orange" : "text-white"
          }`}
        >
          {format(date, "d")}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 px-3 py-3">
        {isRest ? (
          <div className="flex items-center gap-2 h-full">
            <Moon className="w-4 h-4 text-muted-foreground/40 shrink-0" />
            <span className="text-sm text-muted-foreground/60">Descanso</span>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="font-semibold text-sm leading-tight text-white">
              {day?.workout?.name ?? "—"}
            </p>
            {day?.variant && (
              <p className="text-xs text-muted-foreground">
                {day.variant.label}
                {day.variant.km ? ` · ${day.variant.km} km` : ""}
              </p>
            )}
            {day?.variant?.notes && (
              <p className="text-xs text-muted-foreground/70 leading-relaxed">
                {day.variant.notes}
              </p>
            )}
            {/* Links */}
            <div className="flex flex-wrap gap-3 pt-1">
              {day?.fileUrl && (
                <a
                  href={day.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-brand-orange hover:underline min-h-[36px] py-1"
                >
                  <Download className="w-3.5 h-3.5" /> PDF
                </a>
              )}
              {day?.variantFileUrl && (
                <a
                  href={day.variantFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:underline min-h-[36px] py-1"
                >
                  <Map className="w-3.5 h-3.5" /> GPX
                </a>
              )}
              {day?.workout?.link && (
                <a
                  href={day.workout.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-400 hover:underline min-h-[36px] py-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Ver
                </a>
              )}
            </div>
            {/* Optionals */}
            {day?.optionals && day.optionals.length > 0 && (
              <div className="pt-1 border-t border-border/40 mt-1">
                <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wide mb-0.5">
                  Opcionales
                </p>
                {day.optionals.map((opt, i) => (
                  <p key={i} className="text-xs text-muted-foreground">
                    {opt.workout.name}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Desktop card (compact grid cell) ─────────────────────────────────────────

function DesktopDayCard({ dayIndex, date, day }: { dayIndex: number; date: Date; day: Day | undefined }) {
  const isRest = !day || day.isRest;
  const isToday = format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

  return (
    <div
      className={`rounded-xl border p-2 flex flex-col gap-1 min-h-[110px] transition-colors ${
        isToday ? "border-brand-orange bg-brand-orange/5" : "border-border bg-neutral-900"
      }`}
    >
      <div className="flex flex-col items-center">
        <span
          className={`text-[9px] font-bold uppercase tracking-wider ${
            isToday ? "text-brand-orange" : "text-muted-foreground"
          }`}
        >
          {DAY_NAMES_SHORT[dayIndex % 7]}
        </span>
        <span className={`text-sm font-bold ${isToday ? "text-brand-orange" : "text-white"}`}>
          {format(date, "d")}
        </span>
      </div>

      {isRest ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-1">
          <Moon className="w-3.5 h-3.5 text-muted-foreground/40" />
          <span className="text-[9px] text-muted-foreground/50">Descanso</span>
        </div>
      ) : (
        <div className="flex flex-col gap-0.5 flex-1">
          <p className="text-[10px] font-semibold leading-tight line-clamp-2 text-white">
            {day?.workout?.name}
          </p>
          {day?.variant && (
            <p className="text-[9px] text-muted-foreground leading-tight">
              {day.variant.label}{day.variant.km ? ` · ${day.variant.km}km` : ""}
            </p>
          )}
          <div className="flex gap-1.5 mt-auto flex-wrap">
            {day?.fileUrl && (
              <a href={day.fileUrl} target="_blank" rel="noopener noreferrer"
                className="text-[9px] text-brand-orange hover:underline flex items-center gap-0.5">
                <Download className="w-2.5 h-2.5" />PDF
              </a>
            )}
            {day?.variantFileUrl && (
              <a href={day.variantFileUrl} target="_blank" rel="noopener noreferrer"
                className="text-[9px] text-emerald-400 hover:underline flex items-center gap-0.5">
                <Map className="w-2.5 h-2.5" />GPX
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function findCurrentWeekIndex(schedules: Schedule[]): number {
  if (schedules.length === 0) return 0;
  const today = new Date();
  for (let i = 0; i < schedules.length; i++) {
    const start = parseISO(schedules[i].period.startDate);
    const days = schedules[i].period.type === "BIWEEKLY" ? 14 : 7;
    if (today >= start && today < addDays(start, days)) return i;
  }
  return schedules.length - 1;
}
