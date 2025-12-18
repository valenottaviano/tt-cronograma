"use client";

import { useEffect, useState } from "react";
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  parseISO,
} from "date-fns";
import { motion } from "framer-motion";

interface CountdownProps {
  targetDate: string;
}

export function Countdown({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
  } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const target = parseISO(targetDate);

      const days = differenceInDays(target, now);
      const hours = differenceInHours(target, now) % 24;
      const minutes = differenceInMinutes(target, now) % 60;

      if (days < 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0 });
      } else {
        setTimeLeft({ days, hours, minutes });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000 * 60); // Update every minute

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) {
    return <div className="h-6 w-24 animate-pulse bg-muted rounded" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-2 text-sm font-medium font-mono"
    >
      <div className="flex flex-col items-center">
        <span className="text-xl font-bold leading-none">{timeLeft.days}</span>
        <span className="text-[10px] text-muted-foreground uppercase font-sans">
          Días
        </span>
      </div>
      <span className="text-xl font-bold leading-none pb-3">:</span>
      <div className="flex flex-col items-center">
        <span className="text-xl font-bold leading-none">
          {timeLeft.hours.toString().padStart(2, "0")}
        </span>
        <span className="text-[10px] text-muted-foreground uppercase font-sans">
          Hs
        </span>
      </div>
      <span className="text-xl font-bold leading-none pb-3">:</span>
      <div className="flex flex-col items-center">
        <span className="text-xl font-bold leading-none">
          {timeLeft.minutes.toString().padStart(2, "0")}
        </span>
        <span className="text-[10px] text-muted-foreground uppercase font-sans">
          Min
        </span>
      </div>
    </motion.div>
  );
}
