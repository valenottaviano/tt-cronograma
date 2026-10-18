import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

/**
 * Esqueletos de las pantallas de la app. Copian la forma de cada pantalla para
 * que, al tocar una pestaña, el cambio sea instantáneo y el contenido real
 * «caiga en su lugar» sin saltos.
 */

function Bone({ className }: { className?: string }) {
  return <Skeleton className={cn('bg-neutral-800/80', className)} />;
}

function HeaderBar({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-3xl items-center px-4">
        <h1 className="text-xl font-black uppercase italic tracking-tight">{title}</h1>
      </div>
    </header>
  );
}

function DayCardBone() {
  return (
    <div className="flex items-stretch overflow-hidden rounded-2xl border border-border bg-neutral-900">
      <div className="flex min-w-[64px] flex-col items-center justify-center gap-1.5 bg-neutral-800/50 px-3 py-4">
        <Bone className="h-3 w-7" />
        <Bone className="h-6 w-6" />
      </div>
      <div className="flex flex-1 flex-col justify-center gap-2 px-4 py-4">
        <Bone className="h-4 w-3/5" />
        <Bone className="h-3 w-4/5" />
      </div>
    </div>
  );
}

export function HomeSkeleton() {
  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 px-4 pb-6 pt-[calc(env(safe-area-inset-top)+1.25rem)]">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Bone className="h-3 w-36" />
          <Bone className="h-8 w-48" />
        </div>
        <div className="flex gap-2 pt-1">
          <Bone className="h-10 w-10 rounded-full" />
          <Bone className="h-10 w-10 rounded-full" />
        </div>
      </div>
      <div className="space-y-2">
        <Bone className="h-4 w-12" />
        <DayCardBone />
      </div>
      <div className="space-y-2">
        <Bone className="h-4 w-24" />
        <div className="space-y-4 rounded-2xl border border-border bg-neutral-900 p-4">
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: 7 }, (_, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <Bone className="h-2.5 w-3" />
                <Bone className="h-8 w-8 rounded-full" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <Bone className="h-7 w-8" />
                <Bone className="h-2.5 w-14" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Bone className="h-4 w-32" />
        <Bone className="h-[76px] w-full rounded-2xl" />
      </div>
    </main>
  );
}

export function ScheduleSkeleton() {
  return (
    <>
      <HeaderBar title="Entrenamiento" />
      <div className="border-b border-border bg-neutral-950">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-2.5">
          <Bone className="h-9 w-9" />
          <Bone className="h-4 w-36" />
          <Bone className="h-9 w-9" />
        </div>
      </div>
      <main className="mx-auto w-full max-w-3xl space-y-2 px-4 py-4">
        {Array.from({ length: 7 }, (_, i) => (
          <DayCardBone key={i} />
        ))}
      </main>
    </>
  );
}

export function DayDetailSkeleton() {
  return (
    <>
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 pt-[env(safe-area-inset-top)] backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center gap-2 px-2">
          <Bone className="h-10 w-10 rounded-full" />
          <div className="flex flex-1 justify-center">
            <Bone className="h-4 w-40" />
          </div>
          <Bone className="h-10 w-10 rounded-full" />
          <Bone className="h-10 w-10 rounded-full" />
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl space-y-4 px-4 py-5">
        <Bone className="h-8 w-4/5" />
        <div className="flex gap-2">
          <Bone className="h-6 w-16 rounded-full" />
          <Bone className="h-6 w-14 rounded-full" />
        </div>
        <Bone className="h-4 w-full" />
        <Bone className="h-4 w-11/12" />
        <Bone className="h-4 w-2/3" />
        <Bone className="h-72 w-full rounded-2xl" />
      </main>
    </>
  );
}

/** Sólo las tarjetas: lo usa también `RacesSection` mientras trae las carreras. */
export function RaceCardsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="flex items-center justify-between rounded-xl border border-border bg-neutral-900 p-4">
          <div className="space-y-2">
            <Bone className="h-4 w-44" />
            <Bone className="h-3 w-32" />
          </div>
          <Bone className="h-8 w-24 rounded-md" />
        </div>
      ))}
    </div>
  );
}

export function RacesSkeleton() {
  return (
    <>
      <HeaderBar title="Carreras" />
      <main className="mx-auto w-full max-w-3xl space-y-3 px-4 py-4">
        <Bone className="h-10 w-full rounded-lg" />
        <RaceCardsSkeleton />
      </main>
    </>
  );
}

export function ProfileSkeleton() {
  return (
    <>
      <HeaderBar title="Perfil" />
      <main className="mx-auto max-w-lg space-y-8 px-4 py-6">
        <div className="flex flex-col items-center gap-3">
          <Bone className="h-24 w-24 rounded-full" />
          <Bone className="h-4 w-40" />
          <Bone className="h-3 w-24" />
        </div>
        {[3, 4, 1].map((rows, g) => (
          <div key={g} className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-neutral-900">
            {Array.from({ length: rows }, (_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3.5">
                <Bone className="h-5 w-5" />
                <Bone className="h-4 w-40" />
              </div>
            ))}
          </div>
        ))}
      </main>
    </>
  );
}

export function VideosSkeleton() {
  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 px-4 py-16">
      <Bone className="h-3 w-40" />
      <Bone className="h-10 w-56" />
      {Array.from({ length: 3 }, (_, i) => (
        <Bone key={i} className="aspect-video w-full rounded-2xl" />
      ))}
    </main>
  );
}
