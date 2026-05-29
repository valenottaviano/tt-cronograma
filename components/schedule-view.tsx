"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Schedule, Day } from "@/lib/coachApi";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  LogOut,
  Map,
  Moon,
  User,
} from "lucide-react";
import { format, addDays, parseISO, differenceInCalendarDays, startOfISOWeek, endOfISOWeek, addWeeks } from "date-fns";
import { es } from "date-fns/locale";

function dayLabel(date: Date) {
  return format(date, "eee", { locale: es });
}

// One Mon–Sun calendar week view
interface WeekView {
  schedule: Schedule;
  weekStart: Date;        // always Monday
  weekEnd: Date;          // always Sunday
  scheduleStart: Date;    // for dayIndex calculation
  totalDays: number;      // 7 or 14
}

function mondayOf(date: Date): Date {
  return startOfISOWeek(date); // ISO week always starts Monday
}

// Parse a YYYY-MM-DD string as local midnight (avoids UTC offset shifting the day)
function parseLocalDate(dateStr: string): Date {
  return parseISO(dateStr + "T00:00:00");
}

function buildViews(schedules: Schedule[]): WeekView[] {
  const views: WeekView[] = [];
  for (const s of schedules) {
    const scheduleStart = parseLocalDate(s.period.startDate);
    const totalDays = s.period.type === "BIWEEKLY" ? 14 : 7;
    const scheduleEnd = addDays(scheduleStart, totalDays - 1);

    // Generate one Mon–Sun view per calendar week covered by the schedule
    let weekStart = mondayOf(scheduleStart);
    const lastWeekStart = mondayOf(scheduleEnd);

    while (weekStart <= lastWeekStart) {
      views.push({
        schedule: s,
        weekStart,
        weekEnd: endOfISOWeek(weekStart),
        scheduleStart,
        totalDays,
      });
      weekStart = addWeeks(weekStart, 1);
    }
  }
  return views;
}

function findCurrentViewIndex(views: WeekView[]): number {
  const today = new Date();
  for (let i = 0; i < views.length; i++) {
    if (today >= views[i].weekStart && today <= views[i].weekEnd) return i;
  }
  return views.length - 1;
}

interface Props {
  schedules: Schedule[];
  athleteName: string;
  dni: string;
}

export function ScheduleView({ schedules, athleteName, dni }: Props) {
  const router = useRouter();
  const views = buildViews(schedules);
  const [viewIndex, setViewIndex] = useState(() => findCurrentViewIndex(views));

  async function handleLogout() {
    await fetch("/api/client/auth/logout", { method: "POST" });
    router.push("/");
  }

  if (views.length === 0) {
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

  const view = views[viewIndex];
  const { schedule, weekStart, weekEnd, scheduleStart, totalDays } = view;

  const dayMap: Record<number, Day> = {};
  schedule.days.forEach((d) => { dayMap[d.dayIndex] = d; });

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      {/* ── Header ── */}
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="px-4 h-14 flex items-center justify-between max-w-3xl mx-auto w-full">
          <div className="flex items-center gap-2.5 min-w-0">
            <a href="/" className="shrink-0">
              <img src="/logo-tt.png" alt="Volver al inicio" className="h-7 w-auto" />
            </a>
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
            onClick={() => setViewIndex((i) => i - 1)}
            disabled={viewIndex === 0}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="text-center min-w-0">
            <p className="font-semibold text-sm">
              {format(weekStart, "d MMM", { locale: es })} — {format(weekEnd, "d MMM yyyy", { locale: es })}
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => setViewIndex((i) => i + 1)}
            disabled={viewIndex === views.length - 1}
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
              Mensaje de Rober
            </p>
            <p className="text-sm leading-relaxed">{schedule.coachNoteExternal}</p>
          </div>
        )}

        {/* Mobile: vertical list */}
        <div className="flex flex-col gap-2 md:hidden">
          {Array.from({ length: 7 }, (_, i) => {
            const date = addDays(weekStart, i);
            const idx = differenceInCalendarDays(date, scheduleStart);
            const inSchedule = idx >= 0 && idx < totalDays;
            return (
              <MobileDayCard key={i} date={date} day={inSchedule ? dayMap[idx] : undefined} dimmed={!inSchedule} />
            );
          })}
        </div>

        {/* Desktop: 7-col grid */}
        <div className="hidden md:grid md:grid-cols-7 gap-2">
          {Array.from({ length: 7 }, (_, i) => {
            const date = addDays(weekStart, i);
            const idx = differenceInCalendarDays(date, scheduleStart);
            const inSchedule = idx >= 0 && idx < totalDays;
            return (
              <DesktopDayCard key={i} date={date} day={inSchedule ? dayMap[idx] : undefined} dimmed={!inSchedule} />
            );
          })}
        </div>
      </main>
    </div>
  );
}

// ── Attachment helpers ────────────────────────────────────────────────────────

interface AttachmentProps {
  fileUrl?: string | null;
  variantFileUrl?: string | null;
  workoutLink?: string | null;
  variantLink?: string | null;
}

function gpxProxyUrl(url: string) {
  return `/api/client/gpx-download?url=${encodeURIComponent(url)}`;
}

// Full pill buttons — used in the mobile card
function AttachmentLinks({ fileUrl, variantFileUrl, workoutLink, variantLink }: AttachmentProps) {
  const items = [
    fileUrl        && { href: gpxProxyUrl(fileUrl),        download: true, icon: <Download className="w-3.5 h-3.5" />, label: "Descargar",     cls: "bg-brand-orange/10 text-brand-orange border-brand-orange/30 hover:bg-brand-orange/20" },
    variantFileUrl && { href: gpxProxyUrl(variantFileUrl), download: true, icon: <Map className="w-3.5 h-3.5" />,      label: "Recorrido",     cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20" },
    workoutLink    && { href: workoutLink,     download: false, icon: <ExternalLink className="w-3.5 h-3.5" />, label: "Ver más",       cls: "bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/20" },
    variantLink    && { href: variantLink,     download: false, icon: <ExternalLink className="w-3.5 h-3.5" />, label: "Más info",     cls: "bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/20" },
  ].filter(Boolean) as { href: string; download: boolean; icon: React.ReactNode; label: string; cls: string }[];

  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 pt-2">
      {items.map((item) => (
        <a
          key={item.href}
          href={item.href}
          {...(item.download ? {} : { target: "_blank", rel: "noopener noreferrer" })}
          className={`inline-flex items-center gap-1.5 px-3 h-[36px] rounded-full border text-xs font-medium transition-colors ${item.cls}`}
        >
          {item.icon}
          {item.label}
        </a>
      ))}
    </div>
  );
}

// Compact dot indicators — used in the desktop grid cell
function AttachmentDots({ fileUrl, variantFileUrl, workoutLink, variantLink }: AttachmentProps) {
  const items = [
    fileUrl        && { href: gpxProxyUrl(fileUrl),        download: true,  icon: <Download className="w-2.5 h-2.5" />, cls: "text-brand-orange" },
    variantFileUrl && { href: gpxProxyUrl(variantFileUrl), download: true,  icon: <Map className="w-2.5 h-2.5" />,      cls: "text-emerald-400" },
    (workoutLink || variantLink) && { href: (workoutLink || variantLink)!, download: false, icon: <ExternalLink className="w-2.5 h-2.5" />, cls: "text-blue-400" },
  ].filter(Boolean) as { href: string; download: boolean; icon: React.ReactNode; cls: string }[];

  if (items.length === 0) return null;

  return (
    <div className="flex gap-1 mt-auto">
      {items.map((item) => (
        <a
          key={item.href}
          href={item.href}
          {...(item.download ? {} : { target: "_blank", rel: "noopener noreferrer" })}
          className={`flex items-center justify-center w-5 h-5 rounded-full bg-white/5 hover:bg-white/10 transition-colors ${item.cls}`}
          title={item.href}
        >
          {item.icon}
        </a>
      ))}
    </div>
  );
}

// ── Mobile card ───────────────────────────────────────────────────────────────

function MobileDayCard({ date, day, dimmed }: { date: Date; day: Day | undefined; dimmed?: boolean }) {
  const isRest = !day || day.isRest;
  const isToday = format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
  const [open, setOpen] = useState(isToday);

  const hasDetails = !isRest && (
    day?.variant?.notes ||
    day?.fileUrl ||
    day?.variantFileUrl ||
    day?.workout?.link ||
    day?.variant?.link ||
    (day?.optionals && day.optionals.length > 0)
  );

  return (
    <div
      className={`rounded-2xl border overflow-hidden transition-opacity ${
        dimmed ? "opacity-30" : ""
      } ${isToday ? "border-brand-orange" : "border-border"} ${isRest ? "bg-neutral-950/60" : "bg-neutral-900"}`}
    >
      {/* Always-visible row */}
      <div
        className={`flex items-stretch ${hasDetails ? "cursor-pointer" : ""}`}
        onClick={() => hasDetails && setOpen(o => !o)}
      >
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
            {dayLabel(date)}
          </span>
          <span
            className={`text-xl font-bold leading-tight ${
              isToday ? "text-brand-orange" : "text-white"
            }`}
          >
            {format(date, "d")}
          </span>
        </div>

        <div className="flex-1 flex flex-col justify-center px-3 py-3 min-w-0">
          {isRest ? (
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-muted-foreground/40 shrink-0" />
              <span className="text-sm text-muted-foreground/60">Descanso</span>
            </div>
          ) : (
            <>
              <p className="font-semibold text-sm leading-tight text-white truncate">
                {day?.workout?.name ?? "—"}
              </p>
              {day?.variant?.notes && (
                <p className="text-xs text-muted-foreground/60 leading-snug mt-0.5 truncate">
                  {day.variant.notes}
                </p>
              )}
            </>
          )}
        </div>

        {hasDetails && (
          <div className="flex items-center pr-3">
            <ChevronDown
              className={`w-4 h-4 text-muted-foreground/50 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            />
          </div>
        )}
      </div>

      {/* Expandable details */}
      {hasDetails && open && (
        <div className="px-3 pb-3 space-y-1 border-t border-border/30">
          {day?.workout?.description && (
            <p className="text-xs text-muted-foreground/70 leading-relaxed pt-2">
              {day.workout.description}
            </p>
          )}
          <AttachmentLinks
            fileUrl={day?.fileUrl}
            variantFileUrl={day?.variantFileUrl}
            workoutLink={day?.workout?.link}
            variantLink={day?.variant?.link}
          />
          {day?.optionals && day.optionals.length > 0 && (
            <div className="pt-2 border-t border-border/40 mt-1">
              <p className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest mb-1.5">Opcionales</p>
              {day.optionals.map((opt, i) => (
                <div key={i} className="mb-1">
                  <p className="text-xs text-muted-foreground">{opt.workout.name}</p>
                  {opt.variant?.notes && (
                    <p className="text-xs text-muted-foreground/60 leading-relaxed">{opt.variant.notes}</p>
                  )}
                  {opt.workout.description && (
                    <p className="text-xs text-muted-foreground/60 leading-relaxed">{opt.workout.description}</p>
                  )}
                  <AttachmentLinks
                    fileUrl={opt.fileUrl}
                    variantFileUrl={opt.variantFileUrl}
                    workoutLink={opt.workout.link}
                    variantLink={opt.variant?.link}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Desktop card ──────────────────────────────────────────────────────────────

function DesktopDayCard({ date, day, dimmed }: { date: Date; day: Day | undefined; dimmed?: boolean }) {
  const isRest = !day || day.isRest;
  const isToday = format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

  return (
    <div
      className={`rounded-xl border p-2 flex flex-col gap-1 min-h-[110px] transition-opacity ${
        dimmed ? "opacity-30" : ""
      } ${isToday ? "border-brand-orange bg-brand-orange/5" : "border-border bg-neutral-900"}`}
    >
      <div className="flex flex-col items-center">
        <span className={`text-[9px] font-bold uppercase tracking-wider ${isToday ? "text-brand-orange" : "text-muted-foreground"}`}>
          {dayLabel(date)}
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
          <p className="text-[10px] font-semibold leading-tight line-clamp-2 text-white">{day?.workout?.name}</p>
          {day?.variant?.notes && (
            <p className="text-[9px] text-muted-foreground leading-tight line-clamp-2">
              {day.variant.notes}
            </p>
          )}
          <AttachmentDots
            fileUrl={day?.fileUrl}
            variantFileUrl={day?.variantFileUrl}
            workoutLink={day?.workout?.link}
            variantLink={day?.variant?.link}
          />
        </div>
      )}
    </div>
  );
}
