"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Race } from "@/lib/coachApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarDays, Loader2, MapPin, Pencil, Route, Search } from "lucide-react";

/** Tope del campo en la API del panel. Acá sólo evita que se pase. */
const DISTANCE_MAX = 60;

export function RacesSection() {
  const router = useRouter();
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  // Carrera cuyo diálogo de distancia está abierto. `mode` distingue anotarse
  // (todavía no hay inscripción) de corregir una distancia ya guardada.
  const [dialogRace, setDialogRace] = useState<Race | null>(null);
  const [dialogMode, setDialogMode] = useState<"enroll" | "edit">("enroll");
  const [distanceInput, setDistanceInput] = useState("");
  const [saving, setSaving] = useState(false);

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

  function openDialog(race: Race, mode: "enroll" | "edit") {
    setDialogRace(race);
    setDialogMode(mode);
    setDistanceInput(race.distance ?? "");
  }

  function closeDialog() {
    setDialogRace(null);
    setDistanceInput("");
  }

  function patchRace(raceId: string, changes: Partial<Race>) {
    setRaces((prev) => prev.map((r) => (r.id === raceId ? { ...r, ...changes } : r)));
  }

  /** Inscribirse (con la distancia del diálogo) o corregir la distancia. */
  async function submitDistance() {
    if (!dialogRace || saving) return;
    const race = dialogRace;
    const distance = distanceInput.trim() || null;
    setSaving(true);

    try {
      const res = await fetch(`/api/client/races/${race.id}/enroll`, {
        method: dialogMode === "enroll" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ distance }),
      });
      if (res.status === 401) {
        router.push("/");
        return;
      }
      if (!res.ok) throw new Error("Error al guardar");

      patchRace(race.id, { enrolled: true, distance });
      closeDialog();
      toast.success(
        dialogMode === "enroll"
          ? `Te anotaste en ${race.name}`
          : "Distancia actualizada"
      );
    } catch {
      toast.error("No pudimos guardar. Probá de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  /** Bajarse de una carrera. Sigue siendo de un toque, sin diálogo. */
  async function unenroll(race: Race) {
    if (enrolling.has(race.id)) return;

    setEnrolling((prev) => new Set(prev).add(race.id));
    patchRace(race.id, { enrolled: false, distance: null });

    try {
      const res = await fetch(`/api/client/races/${race.id}/enroll`, { method: "DELETE" });
      if (res.status === 401) {
        router.push("/");
        return;
      }
      if (!res.ok && res.status !== 204) throw new Error("Error al desinscribirse");
    } catch {
      patchRace(race.id, { enrolled: true, distance: race.distance });
      toast.error("No pudimos darte de baja. Probá de nuevo.");
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
                      onClick={() => (race.enrolled ? unenroll(race) : openDialog(race, "enroll"))}
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

                {race.enrolled && (
                  <button
                    type="button"
                    onClick={() => openDialog(race, "edit")}
                    className="w-full flex items-center gap-2 border-t border-red-600/20 px-4 py-2.5 text-left transition-colors hover:bg-red-600/10"
                  >
                    <Route className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    {race.distance ? (
                      <span className="text-xs text-white truncate">
                        Corrés <span className="font-semibold">{race.distance}</span>
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground truncate">
                        Agregá qué distancia vas a correr
                      </span>
                    )}
                    <Pencil className="w-3 h-3 ml-auto shrink-0 text-muted-foreground" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={!!dialogRace} onOpenChange={(open) => !open && !saving && closeDialog()}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "enroll" ? `Inscribirte a ${dialogRace?.name}` : dialogRace?.name}
            </DialogTitle>
            {dialogRace && (
              <DialogDescription>
                {format(parseISO(dialogRace.date), "d 'de' MMMM yyyy", { locale: es })}
                {dialogRace.location && ` · ${dialogRace.location}`}
              </DialogDescription>
            )}
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitDistance();
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="race-distance">¿Qué distancia vas a correr?</Label>
              <Input
                id="race-distance"
                value={distanceInput}
                onChange={(e) => setDistanceInput(e.target.value)}
                maxLength={DISTANCE_MAX}
                placeholder="42k"
                autoFocus
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                Escribila como quieras. Podés dejarlo vacío y cargarla después.
              </p>
            </div>

            <DialogFooter className="gap-2 sm:gap-2">
              <Button type="button" variant="outline" onClick={closeDialog} disabled={saving}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving} className="bg-red-600 hover:bg-red-700 text-white border-0">
                {saving && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                {dialogMode === "enroll" ? "Confirmar" : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
