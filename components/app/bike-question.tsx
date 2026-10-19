'use client';

import { useEffect, useState } from 'react';
import { Bike, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

/**
 * Pregunta una sola vez si el atleta tiene bicicleta para los entrenamientos
 * cruzados; Roberto lo ve al planificar. Hay que contestar: no se cierra sin
 * responder. Sólo aparece si el panel dice `hasBike: null` (no contestó): si el
 * campo no viene, o el panel no responde, no se pregunta nada.
 */
export function BikeQuestion() {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/client/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!cancelled && json?.data && json.data.hasBike === null) setOpen(true);
      })
      .catch(() => {
        // Sin red: se pregunta la próxima vez que abra la app.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function answer(hasBike: boolean) {
    setSaving(hasBike);
    try {
      const res = await fetch('/api/client/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hasBike }),
      });
      if (!res.ok) throw new Error();
      setOpen(false);
      toast.success('¡Gracias! Se lo pasamos a Rober');
    } catch {
      toast.error('No se pudo guardar. Probá de nuevo');
    } finally {
      setSaving(null);
    }
  }

  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        className="max-w-sm border-red-600/30 text-center"
      >
        <DialogHeader className="items-center text-center sm:text-center">
          <div className="mb-1 flex h-14 w-14 items-center justify-center rounded-full bg-red-600/15">
            <Bike className="h-7 w-7 text-red-500" />
          </div>
          <DialogTitle className="text-xl font-black italic uppercase">¿Tenés bicicleta muscular?</DialogTitle>
          <DialogDescription>
            Rober la usa para planificar entrenamientos cruzados.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            size="lg"
            disabled={saving !== null}
            onClick={() => answer(false)}
          >
            {saving === false && <Loader2 className="h-4 w-4 animate-spin" />}
            No
          </Button>
          <Button
            size="lg"
            className="bg-red-600 text-white hover:bg-red-700"
            disabled={saving !== null}
            onClick={() => answer(true)}
          >
            {saving === true && <Loader2 className="h-4 w-4 animate-spin" />}
            Sí, tengo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
