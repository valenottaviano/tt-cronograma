"use client";

import { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, ChevronRight, Loader2, User } from "lucide-react";
import Image from "next/image";

type Step = "details" | "avatar";

export default function SetupPage() {
  const router = useRouter();
  const params = useSearchParams();
  const dni = params.get("dni") ?? "";

  const [step, setStep] = useState<Step>("details");
  const [createdDni, setCreatedDni] = useState("");

  // Avatar state (step 2 — user is already logged in at this point)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Details state (step 1)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ── Step 1: submit details ──────────────────────────────────────────────────
  async function handleDetailsSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const email = fd.get("email") as string;
    const phone = fd.get("phone") as string;
    const password = fd.get("password") as string;
    const confirm = fd.get("confirm") as string;

    if (password !== confirm) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/client/auth/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dni,
          email,
          password,
          ...(phone ? { phone: `+54 9 ${phone}` } : {}),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      // Account created + auto-logged in — now advance to avatar step
      setCreatedDni(json.data.dni);
      setStep("avatar");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  // ── Step 2: avatar upload (user is authenticated) ──────────────────────────
  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    setAvatarError("");
    try {
      const presignRes = await fetch("/api/client/auth/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });
      const presignJson = await presignRes.json();
      if (!presignRes.ok) throw new Error(presignJson.error);
      const { uploadUrl, key } = presignJson.data;

      await fetch(uploadUrl, { method: "PUT", body: file });

      // Save avatar key to profile
      setSavingAvatar(true);
      const patchRes = await fetch("/api/client/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarKey: key }),
      });
      if (!patchRes.ok) {
        const pj = await patchRes.json();
        throw new Error(pj.error);
      }

      setAvatarPreview(URL.createObjectURL(file));
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : "Error al subir imagen");
    } finally {
      setUploadingAvatar(false);
      setSavingAvatar(false);
    }
  }

  function handleFinish() {
    router.push(`/schedule/${createdDni}`);
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Configurá tu perfil</h1>
          <p className="mt-1 text-sm text-muted-foreground">DNI: {dni}</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2">
          <div className="h-1.5 w-12 rounded-full bg-brand-orange" />
          <div className={`h-1.5 w-12 rounded-full transition-colors ${step === "avatar" ? "bg-brand-orange" : "bg-neutral-700"}`} />
        </div>

        {/* ── Step 1: Details ── */}
        {step === "details" && (
          <form onSubmit={handleDetailsSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input id="email" name="email" type="email" autoComplete="email" required className="mt-1" />
            </div>

            <div>
              <Label htmlFor="phone">Teléfono (opcional)</Label>
              <div className="flex items-center mt-1">
                <span className="inline-flex items-center h-10 px-3 shrink-0 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm whitespace-nowrap">
                  +54 9
                </span>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="off"
                  placeholder="11 1234-5678"
                  className="rounded-l-none"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Contraseña *</Label>
              <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} className="mt-1" />
            </div>

            <div>
              <Label htmlFor="confirm">Confirmar contraseña *</Label>
              <Input id="confirm" name="confirm" type="password" autoComplete="new-password" required className="mt-1" />
            </div>

            {error && <p className="text-sm text-destructive text-center">{error}</p>}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white mt-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Continuar
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </form>
        )}

        {/* ── Step 2: Avatar (authenticated) ── */}
        {step === "avatar" && (
          <div className="space-y-6">
            <p className="text-center text-muted-foreground text-sm">
              Elegí una foto de perfil (opcional)
            </p>

            <div className="flex flex-col items-center gap-4">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploadingAvatar || savingAvatar}
                className="relative w-32 h-32 rounded-full bg-neutral-800 border-2 border-dashed border-neutral-600 hover:border-brand-orange transition-all duration-200 flex items-center justify-center overflow-hidden group disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {avatarPreview ? (
                  <>
                    <Image src={avatarPreview} alt="Avatar" fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </>
                ) : (uploadingAvatar || savingAvatar) ? (
                  <Loader2 className="w-7 h-7 animate-spin text-muted-foreground" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-brand-orange transition-colors">
                    <User className="w-10 h-10" />
                    <Camera className="w-4 h-4" />
                  </div>
                )}
              </button>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />

              <p className="text-xs text-muted-foreground">
                {avatarPreview ? "Foto lista ✓" : "Tocá el círculo para elegir una imagen"}
              </p>

              {avatarError && <p className="text-sm text-destructive text-center">{avatarError}</p>}
            </div>

            <Button
              onClick={handleFinish}
              disabled={uploadingAvatar || savingAvatar}
              className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white"
            >
              {uploadingAvatar || savingAvatar
                ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Subiendo...</>
                : avatarPreview ? "Ver mi planilla" : "Omitir y continuar"
              }
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
