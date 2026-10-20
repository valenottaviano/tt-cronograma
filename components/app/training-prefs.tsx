'use client';

import { useState } from 'react';
import { Bike, Dumbbell, Loader2, type LucideIcon } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type Field = 'hasGym' | 'hasBike';

/**
 * Lo que Rober usa para planificar: si va al gimnasio y si tiene bicicleta.
 * Se guarda al tocar. Cada fila sólo aparece si el panel manda el campo: un
 * panel viejo no lo manda y no se muestra algo que no se puede guardar.
 */
export function TrainingPrefs({ hasGym, hasBike }: { hasGym?: boolean; hasBike?: boolean | null }) {
  const [values, setValues] = useState<Record<Field, boolean | null | undefined>>({ hasGym, hasBike });
  const [saving, setSaving] = useState<Field | null>(null);

  if (values.hasGym === undefined && values.hasBike === undefined) return null;

  async function save(field: Field, value: boolean) {
    if (saving || values[field] === value) return;
    const previous = values[field];
    setValues((v) => ({ ...v, [field]: value }));
    setSaving(field);
    try {
      const res = await fetch('/api/client/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });
      if (!res.ok) throw new Error();
      toast.success('¡Listo! Se lo pasamos a Rober');
    } catch {
      setValues((v) => ({ ...v, [field]: previous }));
      toast.error('No se pudo guardar. Probá de nuevo');
    } finally {
      setSaving(null);
    }
  }

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Para tu planificación</h2>
        <p className="mt-1 text-xs text-muted-foreground">Rober lo tiene en cuenta al armar tus próximas planillas.</p>
      </div>
      <div className="divide-y divide-border rounded-2xl border border-border bg-neutral-900">
        {values.hasGym !== undefined && (
          <PrefRow
            icon={Dumbbell}
            label="¿Vas al gimnasio?"
            value={values.hasGym}
            saving={saving === 'hasGym'}
            disabled={saving !== null}
            onChange={(v) => save('hasGym', v)}
          />
        )}
        {values.hasBike !== undefined && (
          <PrefRow
            icon={Bike}
            label="¿Tenés bicicleta muscular?"
            value={values.hasBike}
            saving={saving === 'hasBike'}
            disabled={saving !== null}
            onChange={(v) => save('hasBike', v)}
          />
        )}
      </div>
    </section>
  );
}

function PrefRow({
  icon: Icon, label, value, saving, disabled, onChange,
}: {
  icon: LucideIcon;
  label: string;
  value: boolean | null;
  saving: boolean;
  disabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
      <span className="min-w-0 flex-1 text-sm font-medium">{label}</span>
      {saving && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />}
      <div role="radiogroup" aria-label={label} className="flex shrink-0 rounded-full bg-neutral-800 p-0.5">
        {([true, false] as const).map((option) => (
          <button
            key={String(option)}
            type="button"
            role="radio"
            aria-checked={value === option}
            disabled={disabled}
            onClick={() => onChange(option)}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors disabled:cursor-not-allowed',
              value === option ? 'bg-brand-orange text-white' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {option ? 'Sí' : 'No'}
          </button>
        ))}
      </div>
    </div>
  );
}
