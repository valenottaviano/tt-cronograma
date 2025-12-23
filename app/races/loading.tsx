import { Skeleton } from "@/components/ui/skeleton";

export default function RacesLoading() {
  return (
    <div className="min-h-screen bg-background font-sans pt-24">
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center mb-8">
          <Skeleton className="h-10 w-64 mb-4" />
        </div>

        {/* Filters Skeleton */}
        <div className="mb-8 flex flex-wrap gap-4 justify-center">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col space-y-3">
              <Skeleton className="h-[200px] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
