import type { ReactNode } from 'react';

/** Encabezado de cada pestaña de la app: título a la izquierda, una acción opcional a la derecha. */
export function AppHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between gap-3 px-4">
        <h1 className="text-xl font-black uppercase italic tracking-tight">{title}</h1>
        {action}
      </div>
    </header>
  );
}
