import { Skeleton } from "@/components/ui/skeleton";

export default function BenefitsLoading() {
  return (
    <div className="min-h-screen bg-background font-sans pt-24">
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-4 mb-8 text-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-6 w-96 max-w-full" />
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col h-full border rounded-xl overflow-hidden"
            >
              <Skeleton className="h-48 w-full" />
              <div className="p-6 space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="space-y-2 pt-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <Skeleton className="h-10 w-full mt-4" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
