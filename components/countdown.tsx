"use client";

import { useEffect, useMemo, useState } from "react";
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  parseISO,
} from "date-fns";
import { motion } from "framer-motion";

interface CountdownProps {
  targetDate: string;
  isFinished?: boolean;
}

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
};

function computeTimeLeft(targetDate: string): TimeLeft {
  const now = new Date();
  const target = parseISO(targetDate);

  const days = Math.max(0, differenceInDays(target, now));
  const hours = Math.max(0, differenceInHours(target, now) % 24);
  const minutes = Math.max(0, differenceInMinutes(target, now) % 60);

  return { days, hours, minutes };
}

export function Countdown({ targetDate, isFinished }: CountdownProps) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (isFinished) {
      return;
    }

    const timer = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 1000 * 60);

    return () => clearInterval(timer);
  }, [isFinished]);

  const timeLeft = useMemo<TimeLeft>(() => {
    if (isFinished) {
      return { days: 0, hours: 0, minutes: 0 };
    }

    return computeTimeLeft(targetDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- tick is needed to trigger recalc
  }, [targetDate, isFinished, tick]);

  if (isFinished) {
    return (
      <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
        Finalizada
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-2 text-sm font-medium font-mono text-white"
    >
      <div className="flex flex-col items-center">
        <span className="text-xl font-bold leading-none">{timeLeft.days}</span>
        <span className="text-[10px] text-white/60 uppercase font-sans">
          Días
        </span>
      </div>
      <span className="text-xl font-bold leading-none pb-3 text-white/40">
        :
      </span>
      <div className="flex flex-col items-center">
        <span className="text-xl font-bold leading-none">
          {timeLeft.hours.toString().padStart(2, "0")}
        </span>
        <span className="text-[10px] text-white/60 uppercase font-sans">
          Hs
        </span>
      </div>
      <span className="text-xl font-bold leading-none pb-3 text-white/40">
        :
      </span>
      <div className="flex flex-col items-center">
        <span className="text-xl font-bold leading-none">
          {timeLeft.minutes.toString().padStart(2, "0")}
        </span>
        <span className="text-[10px] text-white/60 uppercase font-sans">
          Min
        </span>
      </div>
    </motion.div>
  );
}
