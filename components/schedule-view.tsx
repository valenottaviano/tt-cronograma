"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Schedule, Day } from "@/lib/coachApi";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Flag,
  ImageDown,
  Loader2,
  LogOut,
  Map,
  Moon,
  User,
} from "lucide-react";
import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { RacesSection } from "@/components/races-section";
import { format, addDays, parseISO, differenceInCalendarDays, startOfISOWeek, endOfISOWeek, addWeeks } from "date-fns";
import { es } from "date-fns/locale";

// Hex equivalents of CSS oklch() vars — used in the off-screen export surface where
// css custom properties aren't serializable by html-to-image's canvas renderer.
const EX = {
  bg:            "#171717",
  card:          "#262626",
  cardRest:      "#0d0d0d",
  border:        "rgba(255,255,255,0.1)",
  borderToday:   "#ED241F",
  orange:        "#ED241F",
  orangeBg:      "rgba(237,36,31,0.10)",
  orangeBorder:  "rgba(237,36,31,0.30)",
  textWhite:     "#fafafa",
  textMuted:     "#b3b3b3",
  textDim:       "rgba(255,255,255,0.35)",
  emeraldText:   "#34d399",
  emeraldBg:     "rgba(52,211,153,0.10)",
  emeraldBorder: "rgba(52,211,153,0.30)",
  blueText:      "#60a5fa",
  blueBg:        "rgba(96,165,250,0.10)",
  blueBorder:    "rgba(96,165,250,0.30)",
} as const;

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

// Treat any startDate as local midnight regardless of timezone info
function parseLocalDate(dateStr: string): Date {
  return parseISO(dateStr.slice(0, 10) + "T00:00:00");
}

function buildViews(schedules: Schedule[]): WeekView[] {
  const views: WeekView[] = [];
  for (const s of schedules) {
    const scheduleStart = parseLocalDate(s.period.startDate);
    const totalDays = s.period.totalDays ?? (s.period.type === "BIWEEKLY" ? 14 : 7);
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
  avatarKey?: string | null;
}

function AvatarButton({ avatarKey, dni, router }: { avatarKey?: string | null; dni: string; router: ReturnType<typeof useRouter> }) {
  return (
    <button
      type="button"
      onClick={() => router.push(`/schedule/${dni}/profile`)}
      className="relative w-9 h-9 rounded-full bg-neutral-800 border border-neutral-700 overflow-hidden shrink-0 hover:border-brand-orange transition-colors"
    >
      {avatarKey ? (
        <Image src="/api/client/auth/avatar" alt="Mi perfil" fill className="object-cover" unoptimized />
      ) : (
        <User className="w-4 h-4 text-muted-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      )}
    </button>
  );
}

export function ScheduleView({ schedules, athleteName, dni, avatarKey }: Props) {
  const router = useRouter();
  const views = buildViews(schedules);
  const [viewIndex, setViewIndex] = useState(() => findCurrentViewIndex(views));

  async function handleLogout() {
    await fetch("/api/client/auth/logout", { method: "POST" });
    router.push("/");
  }

  if (views.length === 0) {
    return (
      <div className="relative min-h-dvh bg-background flex flex-col items-center justify-center gap-6 px-4">
        <div className="absolute top-4 right-4">
          <AvatarButton avatarKey={avatarKey} dni={dni} router={router} />
        </div>
        <img src="/logo-tt.png" alt="TT" className="h-16 w-auto" />
        <h1 className="text-2xl font-bold text-center">Hola, {athleteName}</h1>
        <p className="text-muted-foreground text-center max-w-sm">
          Tu entrenador aún no publicó ninguna planilla. Volvé pronto.
        </p>
        <div className="flex flex-col gap-2 w-full max-w-xs">
          <Sheet>
            <SheetTrigger asChild>
              <Button className="gap-2 min-h-[44px] bg-red-600 hover:bg-red-700 text-white border-0">
                <Flag className="w-4 h-4" /> Mis Carreras
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
              <SheetHeader className="mb-4">
                <SheetTitle>Mis Carreras</SheetTitle>
              </SheetHeader>
              <RacesSection />
            </SheetContent>
          </Sheet>
          <Button variant="outline" onClick={() => router.push(`/schedule/${dni}/profile`)} className="gap-2 min-h-[44px]">
            <User className="w-4 h-4" /> Mi Perfil
          </Button>
          <Button variant="outline" onClick={handleLogout} className="gap-2 min-h-[44px]">
            <LogOut className="w-4 h-4" /> Salir
          </Button>
        </div>
      </div>
    );
  }

  const exportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const safeViewIndex = Math.min(viewIndex, views.length - 1);
  const view = views[safeViewIndex];
  const { schedule, weekStart, weekEnd, scheduleStart, totalDays } = view;

  const dayMap: Record<number, Day> = {};
  schedule.days.forEach((d) => { dayMap[d.dayIndex] = d; });

  async function handleDownloadImage() {
    if (isExporting || !exportRef.current) return;
    setIsExporting(true);
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(exportRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: EX.bg,
        width: 640,
      });
      const link = document.createElement("a");
      link.download = `semana-${format(weekStart, "yyyy-MM-dd")}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      setIsExporting(false);
    }
  }

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
          <div className="flex items-center gap-2 shrink-0">
            <AvatarButton avatarKey={avatarKey} dni={dni} router={router} />
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* ── Mis Carreras ── */}
      <div className="border-b border-border bg-neutral-950">
        <div className="px-4 py-2 max-w-3xl mx-auto w-full">
          <Sheet>
            <SheetTrigger asChild>
              <Button className="w-full h-10 bg-red-600 hover:bg-red-700 text-white font-semibold gap-2 border-0">
                <Flag className="w-4 h-4" />
                Mis Carreras
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
              <SheetHeader className="mb-4">
                <SheetTitle>Mis Carreras</SheetTitle>
              </SheetHeader>
              <RacesSection />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* ── Week navigator ── */}
      <div className="border-b border-border bg-neutral-950">
        <div className="px-4 pt-3 pb-2 max-w-3xl mx-auto w-full space-y-2">
          <div className="flex items-center justify-between gap-3">
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
          <div className="flex justify-end">
            <button
              onClick={handleDownloadImage}
              disabled={isExporting}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 py-0.5"
            >
              {isExporting
                ? <Loader2 className="w-3 h-3 animate-spin" />
                : <ImageDown className="w-3 h-3" />}
              Descargar semana
            </button>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <main className="flex-1 px-4 py-4 max-w-3xl mx-auto w-full space-y-4 pb-4">
        {/* Coach note */}
        {schedule.coachNoteExternal && (
          <div className="rounded-xl bg-brand-orange/10 border border-brand-orange/30 px-4 py-3">
            <p className="text-xs font-semibold text-brand-orange mb-1 uppercase tracking-wide">
              Mensaje de Rober
            </p>
            <p className="text-sm leading-relaxed">{schedule.coachNoteExternal}</p>
          </div>
        )}

        {/* Day cards — single column on all screen sizes */}
        <div className="flex flex-col gap-2">
          {Array.from({ length: 7 }, (_, i) => {
            const date = addDays(weekStart, i);
            const idx = differenceInCalendarDays(date, scheduleStart);
            const inSchedule = idx >= 0 && idx < totalDays;
            return (
              <MobileDayCard key={i} date={date} day={inSchedule ? dayMap[idx] : undefined} dimmed={!inSchedule} />
            );
          })}
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-border py-4 px-4">
        <p className="text-center text-xs text-muted-foreground/50">
          Desarrollado por{" "}
          <a
            href="https://wa.me/5493816003467"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-muted-foreground transition-colors underline underline-offset-2"
          >
            Valentín Ottaviano
          </a>
        </p>
      </footer>

      {/* Off-screen export surface — always mounted for html-to-image capture */}
      <div aria-hidden="true" style={{ position: "absolute", left: -9999, top: 0, overflow: "hidden", pointerEvents: "none", zIndex: -1 }}>
        <WeekExportView
          exportRef={exportRef}
          weekStart={weekStart}
          weekEnd={weekEnd}
          scheduleStart={scheduleStart}
          totalDays={totalDays}
          dayMap={dayMap}
          coachNote={schedule.coachNoteExternal}
          athleteName={athleteName}
        />
      </div>
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

// Safari iOS ignores Content-Disposition: attachment and navigates away when clicking
// a plain anchor. Fetching as a blob and using createObjectURL keeps the user on the page.
async function downloadGpxBlob(proxyUrl: string) {
  try {
    const res = await fetch(proxyUrl);
    if (!res.ok) return;
    const cd = res.headers.get("content-disposition") ?? "";
    const match = cd.match(/filename[^;=\n]*=["']?([^"'\n;]+)["']?/);
    const filename = match ? match[1].trim() : "track.gpx";
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  } catch (err) {
    console.error("GPX download failed", err);
  }
}

// Full pill buttons — used in the mobile card
function AttachmentLinks({ fileUrl, variantFileUrl, workoutLink, variantLink }: AttachmentProps) {
  const downloads = [
    fileUrl        && { proxyUrl: gpxProxyUrl(fileUrl),        icon: <Download className="w-3.5 h-3.5" />, label: "Descargar", cls: "bg-brand-orange/10 text-brand-orange border-brand-orange/30 hover:bg-brand-orange/20" },
    variantFileUrl && { proxyUrl: gpxProxyUrl(variantFileUrl), icon: <Map className="w-3.5 h-3.5" />,      label: "Recorrido", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20" },
  ].filter(Boolean) as { proxyUrl: string; icon: React.ReactNode; label: string; cls: string }[];

  const links = [
    workoutLink && { href: workoutLink, icon: <ExternalLink className="w-3.5 h-3.5" />, label: "Ver más",  cls: "bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/20" },
    variantLink && { href: variantLink, icon: <ExternalLink className="w-3.5 h-3.5" />, label: "Más info", cls: "bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/20" },
  ].filter(Boolean) as { href: string; icon: React.ReactNode; label: string; cls: string }[];

  if (downloads.length === 0 && links.length === 0) return null;

  const pillCls = "inline-flex items-center gap-1.5 px-3 h-[36px] rounded-full border text-xs font-medium transition-colors";

  return (
    <div className="flex flex-wrap gap-2 pt-2">
      {downloads.map((item) => (
        <button
          key={item.proxyUrl}
          type="button"
          onClick={() => downloadGpxBlob(item.proxyUrl)}
          className={`${pillCls} ${item.cls}`}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
      {links.map((item) => (
        <a
          key={item.href}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`${pillCls} ${item.cls}`}
        >
          {item.icon}
          {item.label}
        </a>
      ))}
    </div>
  );
}

// ── Export components (off-screen, inline styles only, no oklch) ──────────────

interface ExportAttachmentProps {
  fileUrl?: string | null;
  variantFileUrl?: string | null;
  workoutLink?: string | null;
  variantLink?: string | null;
}

function ExportAttachmentBadges({ fileUrl, variantFileUrl, workoutLink, variantLink }: ExportAttachmentProps) {
  const items = [
    fileUrl        && { href: gpxProxyUrl(fileUrl),        label: "Descargar", color: EX.orange,      bg: EX.orangeBg,   border: EX.orangeBorder },
    variantFileUrl && { href: gpxProxyUrl(variantFileUrl), label: "Recorrido", color: EX.emeraldText, bg: EX.emeraldBg,  border: EX.emeraldBorder },
    workoutLink    && { href: workoutLink,                  label: "Ver más",   color: EX.blueText,    bg: EX.blueBg,     border: EX.blueBorder },
    variantLink    && { href: variantLink,                  label: "Más info",  color: EX.blueText,    bg: EX.blueBg,     border: EX.blueBorder },
  ].filter(Boolean) as { href: string; label: string; color: string; bg: string; border: string }[];

  if (items.length === 0) return null;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, paddingTop: 6 }}>
      {items.map((item) => (
        <span
          key={item.href}
          style={{
            display: "inline-flex", alignItems: "center",
            padding: "2px 10px", borderRadius: 999,
            border: `1px solid ${item.border}`,
            background: item.bg, color: item.color,
            fontSize: 10, fontWeight: 500,
          }}
        >
          {item.label}
        </span>
      ))}
    </div>
  );
}

function ExportDayCard({ date, day, dimmed }: { date: Date; day: Day | undefined; dimmed?: boolean }) {
  const isRest = !day || day.isRest;
  const isToday = format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
  const dayLabelStr = format(date, "eee", { locale: es }).toUpperCase();
  const dayNum = format(date, "d");

  const sidebarBg = isToday ? "rgba(237,36,31,0.15)" : "rgba(38,38,38,0.5)";
  const labelColor = isToday ? EX.orange : EX.textMuted;
  const numColor = isToday ? EX.orange : EX.textWhite;
  const cardBg = isRest ? EX.cardRest : EX.card;
  const borderColor = isToday ? EX.borderToday : EX.border;

  return (
    <div style={{
      borderRadius: 16, border: `1px solid ${borderColor}`,
      overflow: "hidden", background: cardBg,
      opacity: dimmed ? 0.3 : 1,
    }}>
      {/* Header row */}
      <div style={{ display: "flex" }}>
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "10px 12px", minWidth: 56, background: sidebarBg,
        }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", color: labelColor }}>{dayLabelStr}</span>
          <span style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.2, color: numColor }}>{dayNum}</span>
        </div>

        <div style={{ flex: 1, padding: "10px 12px" }}>
          {isRest ? (
            <span style={{ fontSize: 13, color: EX.textMuted }}>Descanso</span>
          ) : (
            <>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: EX.textWhite, lineHeight: 1.3 }}>
                {day?.workout?.name ?? "—"}
              </p>
              {day?.variant?.notes && (
                <p style={{ margin: "2px 0 0", fontSize: 11, color: EX.textMuted, lineHeight: 1.4 }}>
                  {day.variant.notes}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Details */}
      {!isRest && (
        <div style={{ padding: "0 12px 10px 12px", borderTop: `1px solid rgba(255,255,255,0.06)` }}>
          {day?.workout?.description && (
            <p style={{ margin: "8px 0 0", fontSize: 11, color: "#d4d4d4", lineHeight: 1.5 }}>
              {day.workout.description}
            </p>
          )}
          <ExportAttachmentBadges
            fileUrl={day?.fileUrl}
            variantFileUrl={day?.variantFileUrl}
            workoutLink={day?.workout?.link}
            variantLink={day?.variant?.link}
          />
          {day?.optionals && day.optionals.filter(o => o.workout).length > 0 && (
            <div style={{ marginTop: 10, paddingTop: 8, borderTop: `1px solid rgba(255,255,255,0.08)` }}>
              <p style={{ margin: "0 0 6px", fontSize: 9, fontWeight: 700, color: EX.textMuted, textTransform: "uppercase", letterSpacing: "0.12em" }}>
                Opcionales
              </p>
              {day.optionals.filter(o => o.workout).map((opt, i) => (
                <div key={i} style={{ marginBottom: i < day.optionals.filter(o => o.workout).length - 1 ? 8 : 0 }}>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "#e5e5e5" }}>{opt.workout!.name}</p>
                  {opt.variant?.notes && (
                    <p style={{ margin: "1px 0 0", fontSize: 10, color: EX.textMuted }}>{opt.variant.notes}</p>
                  )}
                  {opt.workout.description && (
                    <p style={{ margin: "2px 0 0", fontSize: 10, color: "#d4d4d4", lineHeight: 1.4 }}>{opt.workout.description}</p>
                  )}
                  <ExportAttachmentBadges
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

interface WeekExportViewProps {
  exportRef: React.RefObject<HTMLDivElement | null>;
  weekStart: Date;
  weekEnd: Date;
  scheduleStart: Date;
  totalDays: number;
  dayMap: Record<number, Day>;
  coachNote: string | null;
  athleteName: string;
}

function WeekExportView({ exportRef, weekStart, weekEnd, scheduleStart, totalDays, dayMap, coachNote, athleteName }: WeekExportViewProps) {
  const weekRange = `${format(weekStart, "d MMM", { locale: es })} — ${format(weekEnd, "d MMM yyyy", { locale: es })}`;

  return (
    <div
      ref={exportRef}
      style={{
        width: 640, background: EX.bg,
        fontFamily: "Geist, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        padding: "24px 20px", boxSizing: "border-box",
        color: EX.textWhite,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-tt.png" alt="TT" crossOrigin="anonymous" style={{ height: 36, width: "auto" }} />
        <div style={{ textAlign: "right" }}>
          <p style={{ margin: 0, fontSize: 11, color: EX.textMuted }}>{athleteName}</p>
          <p style={{ margin: "2px 0 0", fontSize: 13, fontWeight: 600, color: EX.textWhite }}>{weekRange}</p>
        </div>
      </div>

      {/* Coach note */}
      {coachNote && (
        <div style={{
          background: EX.orangeBg, border: `1px solid ${EX.orangeBorder}`,
          borderRadius: 12, padding: "10px 14px", marginBottom: 14,
        }}>
          <p style={{ margin: "0 0 4px", fontSize: 9, fontWeight: 700, color: EX.orange, textTransform: "uppercase", letterSpacing: "0.12em" }}>
            Mensaje de Rober
          </p>
          <p style={{ margin: 0, fontSize: 12, color: EX.textWhite, lineHeight: 1.5 }}>{coachNote}</p>
        </div>
      )}

      {/* Day cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {Array.from({ length: 7 }, (_, i) => {
          const date = addDays(weekStart, i);
          const idx = differenceInCalendarDays(date, scheduleStart);
          const inSchedule = idx >= 0 && idx < totalDays;
          return (
            <ExportDayCard key={i} date={date} day={inSchedule ? dayMap[idx] : undefined} dimmed={!inSchedule} />
          );
        })}
      </div>

      {/* Watermark */}
      <p style={{ margin: "16px 0 0", fontSize: 10, color: EX.textDim, textAlign: "center" }}>
        Grupo TT — grupott.com.ar
      </p>
    </div>
  );
}

// ── Day card ──────────────────────────────────────────────────────────────────

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
    (day?.optionals && day.optionals.some(o => o.workout))
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
              <p className={`font-semibold text-sm leading-tight text-white ${open ? "" : "truncate"}`}>
                {day?.workout?.name ?? "—"}
              </p>
              {day?.variant?.notes && (
                <p className={`text-xs text-muted-foreground leading-snug mt-0.5 ${open ? "" : "truncate"}`}>
                  {day.variant.notes}
                </p>
              )}
            </>
          )}
        </div>

        {hasDetails && (
          <div className="flex items-center pr-3">
            <ChevronDown
              className={`w-4 h-4 text-muted-foreground/70 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            />
          </div>
        )}
      </div>

      {/* Expandable details */}
      {hasDetails && open && (
        <div className="px-3 pb-3 space-y-1 border-t border-border/30">
          {day?.workout?.description && (
            <p className="text-xs text-neutral-300 leading-relaxed pt-2">
              {day.workout.description}
            </p>
          )}
          <AttachmentLinks
            fileUrl={day?.fileUrl}
            variantFileUrl={day?.variantFileUrl}
            workoutLink={day?.workout?.link}
            variantLink={day?.variant?.link}
          />
          {day?.optionals && day.optionals.filter(o => o.workout).length > 0 && (
            <div className="pt-2 border-t border-border/40 mt-1">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">Opcionales</p>
              {day.optionals.filter(o => o.workout).map((opt, i) => (
                <div key={i} className="mb-1">
                  <p className="text-xs text-neutral-200 font-medium">{opt.workout!.name}</p>
                  {opt.variant?.notes && (
                    <p className="text-xs text-muted-foreground leading-relaxed">{opt.variant.notes}</p>
                  )}
                  {opt.workout.description && (
                    <p className="text-xs text-neutral-300 leading-relaxed">{opt.workout.description}</p>
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

