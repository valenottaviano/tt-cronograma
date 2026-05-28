"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ClipboardList, Loader2 } from "lucide-react";

type Step = "dni" | "password";

export function PlanillaDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("dni");
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function reset() {
    setStep("dni");
    setDni("");
    setPassword("");
    setError("");
    setLoading(false);
  }

  async function handleDniSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/client/auth/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dni: dni.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      const { exists, hasAccount } = json.data;

      if (!exists) {
        setError("DNI no encontrado. Verificá que estés registrado en el equipo.");
        return;
      }
      if (!hasAccount) {
        setOpen(false);
        router.push(`/schedule/setup?dni=${encodeURIComponent(dni.trim())}`);
        return;
      }
      setStep("password");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/client/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dni: dni.trim(), password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setOpen(false);
      router.push(`/schedule/${json.data.dni}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button className="bg-brand-orange hover:bg-brand-orange/90 text-white px-8 py-6 rounded-full text-lg font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg min-w-[200px]">
          <ClipboardList className="mr-2 h-5 w-5" />
          Planilla
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {step === "dni" ? "Ingresá tu DNI" : "Ingresá tu contraseña"}
          </DialogTitle>
        </DialogHeader>

        {step === "dni" ? (
          <form onSubmit={handleDniSubmit} className="space-y-4">
            <div>
              <Label htmlFor="dialog-dni">DNI</Label>
              <Input
                id="dialog-dni"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="12345678"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                required
                autoFocus
                className="mt-1"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              type="submit"
              disabled={loading || !dni.trim()}
              className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Continuar
            </Button>
          </form>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <p className="text-sm text-muted-foreground">DNI: {dni}</p>
            <div>
              <Label htmlFor="dialog-password">Contraseña</Label>
              <Input
                id="dialog-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
                className="mt-1"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => { setStep("dni"); setError(""); setPassword(""); }}
                className="flex-1"
              >
                Atrás
              </Button>
              <Button
                type="submit"
                disabled={loading || !password}
                className="flex-1 bg-brand-orange hover:bg-brand-orange/90 text-white"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Ingresar
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
