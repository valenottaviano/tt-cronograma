"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Race } from "@/lib/coachApi";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarDays, Loader2, MapPin, Search } from "lucide-react";

export function RacesSection() {
  const router = useRouter();
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/client/races")
      .then(async (res) => {
        if (res.status === 401) {
          router.push("/");
          return;
        }
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Error inesperado");
        setRaces(json.data ?? []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [router]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return races;
    return races.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (r.location ?? "").toLowerCase().includes(q)
    );
  }, [races, query]);

  async function toggleEnroll(race: Race) {
    if (enrolling.has(race.id)) return;

    setEnrolling((prev) => new Set(prev).add(race.id));
    const wasEnrolled = race.enrolled;

    setRaces((prev) =>
      prev.map((r) => (r.id === race.id ? { ...r, enrolled: !wasEnrolled } : r))
    );

    try {
      const res = await fetch(`/api/client/races/${race.id}/enroll`, {
        method: wasEnrolled ? "DELETE" : "POST",
      });
      if (res.status === 401) {
        router.push("/");
        return;
      }
      if (!res.ok && res.status !== 204) {
        throw new Error("Error al actualizar inscripción");
      }
    } catch {
      setRaces((prev) =>
        prev.map((r) => (r.id === race.id ? { ...r, enrolled: wasEnrolled } : r))
      );
    } finally {
      setEnrolling((prev) => {
        const next = new Set(prev);
        next.delete(race.id);
        return next;
      });
    }
  }

  return (
    <div className="flex flex-col gap-4 px-4 pb-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar carrera o lugar..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full h-10 pl-9 pr-4 rounded-lg bg-neutral-800 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-600/50 focus:border-red-600/50 transition"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <p className="text-sm text-destructive text-center py-8">{error}</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          {query ? "Sin resultados." : "No hay carreras disponibles por ahora."}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((race) => {
            const busy = enrolling.has(race.id);
            const date = parseISO(race.date);
            return (
              <div
                key={race.id}
                className={`rounded-xl border transition-colors ${
                  race.enrolled
                    ? "border-red-600/40 bg-red-600/5"
                    : "border-border bg-neutral-900"
                }`}
              >
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm leading-tight text-white">
                      {race.name}
                    </p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarDays className="w-3 h-3 shrink-0" />
                        {format(date, "d 'de' MMMM yyyy", { locale: es })}
                      </span>
                      {race.location && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3 shrink-0" />
                          {race.location}
                        </span>
                      )}
                    </div>
                    {race.description && (
                      <p className="text-xs text-muted-foreground/70 mt-1.5 leading-relaxed">
                        {race.description}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 px-1">
                    <Button
                      size="sm"
                      variant={race.enrolled ? "outline" : "default"}
                      disabled={busy}
                      onClick={() => toggleEnroll(race)}
                      className={`min-w-[110px] h-8 text-xs transition-colors ${
                        race.enrolled
                          ? "border-red-600/50 text-red-500 hover:bg-red-600/10 hover:text-red-400"
                          : "bg-red-600 text-white hover:bg-red-700 border-transparent"
                      }`}
                    >
                      {busy ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : race.enrolled ? (
                        "Desinscribirme"
                      ) : (
                        "Inscribirme"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
