"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { News } from "@/lib/data";

export function NewsNotifier({ news }: { news: News[] }) {
  const hasShownRef = useRef(false);

  useEffect(() => {
    if (hasShownRef.current) return;

    if (news.length > 0) {
      news.forEach((item, index) => {
        setTimeout(() => {
          toast(item.title, {
            description: item.subtitle,
            action: item.link
              ? {
                  label: "Ver más",
                  onClick: () => window.open(item.link, "_blank"),
                }
              : undefined,
            duration: 8000,
          });
        }, index * 500); // Stagger notifications slightly
      });
      hasShownRef.current = true;
    }
  }, [news]);

  return null;
}
