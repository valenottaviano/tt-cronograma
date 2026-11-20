'use client';

import { useState, useSyncExternalStore } from 'react';
import { ShieldPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { INJURY_INSURANCE_URL } from '@/lib/injury-insurance';

const SEEN_KEY = 'tt-seguro-lesiones-visto';

/** `null` = no se puede saber (servidor o sin localStorage): no se muestra. */
function readSeen(): boolean | null {
  try {
    return localStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return null;
  }
}

const subscribeNoop = () => () => {};

/**
 * Presenta el seguro ante lesiones una sola vez (por dispositivo: se recuerda en
 * localStorage). Después queda la fila «Seguro de lesiones» en Perfil. Si el
 * pop-up de la bici está pendiente, espera a la próxima visita para no apilarse.
 */
export function InsuranceIntro({ wait = false }: { wait?: boolean }) {
  const seen = useSyncExternalStore(subscribeNoop, readSeen, () => null);
  const [closed, setClosed] = useState(false);
  const open = !wait && seen === false && !closed;

  function close() {
    setClosed(true);
    try {
      localStorage.setItem(SEEN_KEY, '1');
    } catch {
      // Ídem: no hay dónde recordarlo.
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && close()}>
      <DialogContent className="max-w-sm border-red-600/30 text-center">
        <DialogHeader className="items-center text-center sm:text-center">
          <div className="mb-1 flex h-14 w-14 items-center justify-center rounded-full bg-red-600/15">
            <ShieldPlus className="h-7 w-7 text-red-500" />
          </div>
          <DialogTitle className="text-xl font-black italic uppercase">
            ¿Sabés cómo funciona el seguro ante lesiones?
          </DialogTitle>
          <DialogDescription>Te contamos qué cubre y qué hacer si te lesionás.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Button asChild size="lg" className="bg-red-600 text-white hover:bg-red-700">
            <a href={INJURY_INSURANCE_URL} target="_blank" rel="noopener noreferrer" onClick={close}>
              Ver cómo funciona
            </a>
          </Button>
          <Button variant="ghost" onClick={close} className="text-muted-foreground">
            Ahora no
          </Button>
          <p className="text-xs text-muted-foreground">Lo encontrás siempre en Perfil.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
