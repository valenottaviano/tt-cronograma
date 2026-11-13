'use client';

import { useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { ExternalLink, Loader2, Paperclip, Trash2, X } from 'lucide-react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { parseLocalDate, todayInArgentina } from '@/lib/athlete-days';
import type { MedicalCertificate } from '@/lib/coachApi';
import { cn } from '@/lib/utils';

/** Lado mayor de la foto que se manda: el panel la guarda igual de chica. */
const MAX_SIDE = 1600;
/** El panel no guarda PDF más pesados (no se pueden achicar). */
const MAX_PDF_BYTES = 3 * 1024 * 1024;

/**
 * Achica la foto en el celular antes de subirla: una foto de cámara pesa más
 * que lo que acepta una función de Vercel (4,5 MB) y gasta datos. Si el
 * navegador no la puede leer, va la original y que decida el panel.
 */
async function shrinkImage(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.8));
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

const longDate = (ymd: string) => format(parseLocalDate(ymd), "d 'de' MMMM 'de' yyyy", { locale: es });

export const MEDICAL_COPY = {
  valid: { label: 'Vigente', cls: 'text-emerald-400' },
  expiring: { label: 'Por vencer', cls: 'text-amber-400' },
  expired: { label: 'Vencido', cls: 'text-red-400' },
  missing: { label: 'Falta subirlo', cls: 'text-amber-400' },
} as const;

export function MedicalCertificateDialog({
  medical,
  trigger,
}: {
  medical: MedicalCertificate | null;
  trigger: ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [issuedOn, setIssuedOn] = useState('');
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState<'upload' | 'delete' | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  // Con apto vigente se muestra el actual; «Subir uno nuevo» abre el formulario.
  const [replacing, setReplacing] = useState(false);

  const today = format(todayInArgentina(), 'yyyy-MM-dd');
  const showForm = !medical || replacing || medical.status === 'expired';

  function reset() {
    setFile(null);
    setIssuedOn('');
    setConsent(false);
    setReplacing(false);
    setConfirmDelete(false);
  }

  function pickFile(f: File | null) {
    if (f && f.type === 'application/pdf' && f.size > MAX_PDF_BYTES) {
      toast.error('El PDF supera los 3 MB. Probá subiendo una foto del apto.');
      return;
    }
    setFile(f);
  }

  async function upload() {
    if (!file || !issuedOn || !consent) return;
    setBusy('upload');
    try {
      const body = file.type.startsWith('image/') ? await shrinkImage(file) : file;
      const fd = new FormData();
      fd.append('file', body, file.type.startsWith('image/') ? 'apto.jpg' : file.name);
      fd.append('issuedOn', issuedOn);
      fd.append('consent', 'true');
      const res = await fetch('/api/client/medical-certificate', { method: 'POST', body: fd });
      if (res.status === 401) {
        router.push('/');
        return;
      }
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? 'No se pudo subir el apto');
      toast.success('¡Listo! Tu apto quedó cargado');
      setOpen(false);
      reset();
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo subir el apto');
    } finally {
      setBusy(null);
    }
  }

  async function remove() {
    setBusy('delete');
    try {
      const res = await fetch('/api/client/medical-certificate', { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Borramos tu apto');
      setOpen(false);
      reset();
      router.refresh();
    } catch {
      toast.error('No se pudo borrar. Probá de nuevo');
    } finally {
      setBusy(null);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (busy) return;
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-white">Apto médico</DialogTitle>
          <DialogDescription>
            Para entrenar con Grupo TT necesitás un apto médico vigente. Dura un año desde que lo firma el médico.
          </DialogDescription>
        </DialogHeader>

        {medical && (
          <div className="space-y-3 rounded-xl border border-border bg-neutral-900 p-4">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm text-muted-foreground">Estado</span>
              <span className={cn('text-sm font-semibold', MEDICAL_COPY[medical.status].cls)}>
                {MEDICAL_COPY[medical.status].label}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm text-muted-foreground">Firmado el</span>
              <span className="text-sm">{longDate(medical.issuedOn)}</span>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm text-muted-foreground">{medical.status === 'expired' ? 'Venció el' : 'Vence el'}</span>
              <span className="text-sm">{longDate(medical.expiresOn)}</span>
            </div>
            <div className="flex items-center justify-between gap-3 pt-1">
              <a
                href="/api/client/medical-certificate/file"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-orange hover:underline"
              >
                <ExternalLink className="h-4 w-4" /> Ver mi apto
              </a>
              {confirmDelete ? (
                <span className="flex items-center gap-2 text-sm">
                  <button
                    type="button"
                    onClick={remove}
                    disabled={busy !== null}
                    className="font-semibold text-red-400 hover:underline"
                  >
                    {busy === 'delete' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sí, borrar'}
                  </button>
                  <button type="button" onClick={() => setConfirmDelete(false)} className="text-muted-foreground">
                    No
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" /> Borrar
                </button>
              )}
            </div>
          </div>
        )}

        {showForm ? (
          <div className="flex flex-col gap-4 py-1">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="apto-file" className="text-sm font-medium text-white">
                Foto o PDF del apto
              </label>
              {file ? (
                <div className="flex h-10 items-center gap-2 rounded-lg border border-border bg-neutral-900 px-3 text-sm">
                  <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="flex-1 truncate text-white">{file.name}</span>
                  <button type="button" onClick={() => setFile(null)} className="text-muted-foreground hover:text-white">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border bg-neutral-900 px-3 text-sm text-muted-foreground transition-colors hover:bg-neutral-800">
                  <Paperclip className="h-4 w-4 shrink-0" />
                  Sacale una foto o elegí el archivo
                  <input
                    id="apto-file"
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
                  />
                </label>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="apto-date" className="text-sm font-medium text-white">
                Fecha en que lo firmó el médico
              </label>
              <input
                id="apto-date"
                type="date"
                value={issuedOn}
                max={today}
                onChange={(e) => setIssuedOn(e.target.value)}
                className="h-10 rounded-lg border border-border bg-neutral-900 px-3 text-sm text-white [color-scheme:dark]"
              />
            </div>

            <label className="flex items-start gap-3 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-brand-orange"
              />
              <span>
                Acepto que Grupo TT guarde mi apto médico para controlar que esté vigente. Sólo lo ve el coach, y lo
                puedo borrar cuando quiera. Más info en{' '}
                <a href="/privacidad" target="_blank" className="underline">
                  Privacidad
                </a>
                .
              </span>
            </label>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setReplacing(true)}
            className="text-sm font-medium text-brand-orange hover:underline"
          >
            Subir uno nuevo
          </button>
        )}

        {showForm && (
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy !== null} className="text-muted-foreground">
              Ahora no
            </Button>
            <Button
              onClick={upload}
              disabled={busy !== null || !file || !issuedOn || !consent}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {busy === 'upload' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Subir apto'}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
