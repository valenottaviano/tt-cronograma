"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { AthleteProfile } from "@/lib/coachApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Check, Loader2, User } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { AppHeader } from "@/components/app/app-header";

interface Props {
  initialProfile: AthleteProfile | null;
  dni: string;
  /** El menú de la pestaña Perfil (credencial, pagos, avisos…), debajo de la foto. */
  children?: React.ReactNode;
}

export function ProfileView({ initialProfile, dni, children }: Props) {
  const router = useRouter();
  const [profile, setProfile] = useState(initialProfile);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Contact form
  const [email, setEmail] = useState(initialProfile?.email ?? "");
  const [phone, setPhone] = useState(stripPrefix(initialProfile?.phone));
  const [birthDate, setBirthDate] = useState(initialProfile?.birthDate ?? "");
  // Un panel viejo no manda el campo: no se muestra algo que no se puede guardar.
  const supportsBirthDate = initialProfile?.birthDate !== undefined;
  const [savingContact, setSavingContact] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  // El cartel de Inicio trae a /perfil#datos. Al llegar con navegación de cliente el
  // navegador no baja solo (la pantalla entra animada), así que se baja a mano.
  useEffect(() => {
    if (window.location.hash !== "#datos") return;
    const id = window.setTimeout(() => {
      document.getElementById("datos")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 250);
    return () => window.clearTimeout(id);
  }, []);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      // Upload via server proxy to avoid CORS with MinIO
      const fd = new FormData();
      fd.append("file", file);
      const uploadRes = await fetch("/api/client/auth/upload", { method: "POST", body: fd });
      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadJson.error);
      const { key } = uploadJson.data;

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
      router.refresh();
      toast.success("Foto actualizada");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al subir imagen");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleContactSave(e: React.FormEvent) {
    e.preventDefault();
    setSavingContact(true);
    try {
      const res = await fetch("/api/client/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email || undefined,
          phone: phone ? `+54 9 ${phone}` : null,
          ...(supportsBirthDate ? { birthDate: birthDate || null } : {}),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      if (profile) setProfile({ ...profile, email: email || null, phone: phone ? `+54 9 ${phone}` : null });
      router.refresh();
      toast.success("Datos actualizados");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSavingContact(false);
    }
  }

  async function handlePasswordSave(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    setSavingPassword(true);
    try {
      const res = await fetch("/api/client/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Contraseña actualizada");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cambiar contraseña");
    } finally {
      setSavingPassword(false);
    }
  }

  const avatarSrc = avatarPreview ?? (profile?.avatarKey ? "/api/client/auth/avatar" : null);

  return (
    <>
      <AppHeader title="Perfil" />

      <main className="px-4 py-6 max-w-lg mx-auto space-y-8">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploadingAvatar}
            className="relative w-24 h-24 rounded-full bg-neutral-800 border-2 border-neutral-700 hover:border-brand-orange transition-colors overflow-hidden group disabled:opacity-60"
          >
            {avatarSrc ? (
              <Image src={avatarSrc} alt="Avatar" fill className="object-cover" unoptimized />
            ) : (
              <User className="w-10 h-10 text-muted-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {uploadingAvatar
                ? <Loader2 className="w-5 h-5 animate-spin text-white" />
                : <Camera className="w-5 h-5 text-white" />}
            </div>
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          <div className="text-center">
            <p className="font-semibold">{profile?.name ?? "—"}</p>
            <p className="text-sm text-muted-foreground">DNI {profile?.dni ?? dni}</p>
          </div>
        </div>

        {children}

        {/* Contact info */}
        <section id="datos" className="scroll-mt-20 space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Datos personales</h2>
          <form onSubmit={handleContactSave} className="space-y-4">
            <div>
              <Label htmlFor="p-email">Email</Label>
              <Input
                id="p-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
            </div>
            {supportsBirthDate && (
              <div>
                <Label htmlFor="p-birth">Fecha de nacimiento</Label>
                <Input
                  id="p-birth"
                  type="date"
                  min="1920-01-01"
                  max={new Date().toISOString().slice(0, 10)}
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="mt-1 [color-scheme:dark]"
                />
              </div>
            )}
            <div>
              <Label htmlFor="p-phone">Teléfono</Label>
              <div className="flex items-center mt-1">
                <span className="inline-flex items-center h-10 px-3 shrink-0 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm whitespace-nowrap">
                  +54 9
                </span>
                <Input
                  id="p-phone"
                  type="tel"
                  autoComplete="off"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="11 1234-5678"
                  className="rounded-l-none"
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={savingContact}
              className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white"
            >
              {savingContact
                ? <Loader2 className="w-4 h-4 animate-spin mr-2" />
                : <Check className="w-4 h-4 mr-2" />}
              Guardar cambios
            </Button>
          </form>
        </section>

        {/* Password change */}
        <section className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Cambiar contraseña</h2>
          <form onSubmit={handlePasswordSave} className="space-y-4">
            <div>
              <Label htmlFor="p-current">Contraseña actual</Label>
              <Input
                id="p-current"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="p-new">Nueva contraseña</Label>
              <Input
                id="p-new"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="p-confirm">Confirmar nueva contraseña</Label>
              <Input
                id="p-confirm"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <Button
              type="submit"
              disabled={savingPassword || !currentPassword || !newPassword || !confirmPassword}
              variant="outline"
              className="w-full"
            >
              {savingPassword
                ? <Loader2 className="w-4 h-4 animate-spin mr-2" />
                : <Check className="w-4 h-4 mr-2" />}
              Cambiar contraseña
            </Button>
          </form>
        </section>
      </main>
    </>
  );
}

function stripPrefix(phone: string | null | undefined): string {
  if (!phone) return "";
  // Remove "+54 9 " prefix if present
  return phone.replace(/^\+54 9 ?/, "").trim();
}
