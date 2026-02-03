"use client";

import { useState, useEffect, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ImageWithSkeletonProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

export function ImageWithSkeleton({
  src,
  alt,
  className,
  fallbackSrc = "https://images.unsplash.com/photo-1533560906234-8f85e186d6ea?q=80&w=1000&auto=format&fit=crop",
  ...props
}: ImageWithSkeletonProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    let rafId: number | null = null;
    const timer = window.setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    if (imgRef.current?.complete) {
      rafId = window.requestAnimationFrame(() => setIsLoading(false));
    }

    return () => {
      window.clearTimeout(timer);
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full bg-muted overflow-hidden">
      {isLoading && (
        <Skeleton className="absolute inset-0 w-full h-full z-10" />
      )}
      <img
        ref={imgRef}
        src={error ? fallbackSrc : src}
        alt={alt}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-700",
          isLoading ? "opacity-0" : "opacity-100",
          className
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setError(true);
          setIsLoading(false);
        }}
        {...props}
      />
    </div>
  );
}
