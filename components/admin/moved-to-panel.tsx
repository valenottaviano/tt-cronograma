import Link from 'next/link';
import { ExternalLink, Info } from 'lucide-react';

const PANEL_URL = process.env.NEXT_PUBLIC_COACH_PANEL_URL ?? 'https://plan.grupott.com.ar';

interface Props {
  /** Nombre de la sección, como la conocía quien la usaba acá. */
  title: string;
  /** Ruta dentro del panel del coach, ej. `/web/races`. */
  panelPath: string;
  /** Cómo llegar ahí, en palabras: "Contenido web → Carreras". */
  panelLabel: string;
  /** Por qué se movió. Se muestra tal cual. */
  why: string;
  /** Página pública donde se ve el resultado, si hay una. */
  publicPath?: string;
}

/**
 * Cartel para una sección del admin que se migró al panel del coach.
 *
 * Existe para no dejar un CRUD funcionando contra un Firestore que ya nadie lee:
 * eso perdería las ediciones en silencio, que es peor que no tener la pantalla.
 */
export function MovedToPanel({ title, panelPath, panelLabel, why, publicPath }: Props) {
  return (
    <div className="max-w-2xl space-y-6 py-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">Esta sección se administra desde el panel del coach.</p>
      </div>

      <div className="space-y-4 rounded-2xl border p-6">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
          <div className="space-y-1 text-sm">
            <p className="font-semibold text-foreground">¿Por qué se movió?</p>
            <p className="text-muted-foreground">{why}</p>
          </div>
        </div>

        <Link
          href={`${PANEL_URL}${panelPath}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Abrir {panelLabel}
          <ExternalLink className="h-4 w-4" />
        </Link>
      </div>

      {publicPath && (
        <p className="text-sm text-muted-foreground">
          Lo que se carga en el panel se ve en{' '}
          <Link href={publicPath} className="underline underline-offset-4">
            {publicPath}
          </Link>{' '}
          de este sitio, con hasta 5 minutos de demora por cache.
        </p>
      )}
    </div>
  );
}
