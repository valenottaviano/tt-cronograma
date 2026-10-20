"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

/** Destino del link del mail de "olvidé mi contraseña". */
export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}

type LinkState = { state: "checking" } | { state: "valid"; name: string } | { state: "invalid"; error: string };

function ResetPasswordContent() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";
  const [checked, setChecked] = useState<LinkState>({ state: "checking" });
  const link: LinkState = token ? checked : { state: "invalid", error: "Falta el link. Abrí el que te llegó por mail." };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    fetch("/api/client/auth/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.error ?? "No pudimos abrir el link. Probá de nuevo en un rato.");
        setChecked({ state: "valid", name: json.data?.name ?? "" });
      })
      .catch((err) => setChecked({ state: "invalid", error: err instanceof Error ? err.message : "Error inesperado" }));
  }, [token]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    const password = fd.get("password") as string;
    if (password.length < 8) return setError("La contraseña debe tener al menos 8 caracteres");
    if (password !== fd.get("confirm")) return setError("Las contraseñas no coinciden");

    setLoading(true);
    try {
      const res = await fetch("/api/client/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "No se pudo guardar. Probá de nuevo en un rato.");
      // Igual que al entrar con DNI: la próxima vez el login ya lo tiene.
      try { localStorage.setItem("tt_dni", json.data.dni); } catch { /* sin storage */ }
      router.push("/inicio");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setLoading(false);
    }
  }

  const firstName = link.state === "valid" ? link.name.trim().split(/\s+/)[0] : "";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Contraseña nueva</h1>
          {firstName && <p className="mt-1 text-sm text-muted-foreground">Hola {firstName}, elegí una contraseña nueva.</p>}
        </div>

        {link.state === "checking" && (
          <div className="flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {link.state === "invalid" && (
          <div className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">{link.error}</p>
            <Button asChild className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white">
              <Link href="/">Ir al inicio</Link>
            </Button>
          </div>
        )}

        {link.state === "valid" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="password">Contraseña nueva</Label>
              <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} autoFocus className="mt-1" />
              <p className="mt-1 text-xs text-muted-foreground">Mínimo 8 caracteres.</p>
            </div>
            <div>
              <Label htmlFor="confirm">Repetila</Label>
              <Input id="confirm" name="confirm" type="password" autoComplete="new-password" required className="mt-1" />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white">
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Guardar y entrar
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
