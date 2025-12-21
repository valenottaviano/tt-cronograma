"use client";

import { useState } from "react";
import Link from "next/link";
import {
  format,
  parseISO,
  isWithinInterval,
  startOfDay,
  endOfDay,
  subWeeks,
  isBefore,
} from "date-fns";
import { es } from "date-fns/locale";
import { MapPin, Calendar as CalendarIcon, ArrowRight } from "lucide-react";
import { DateRange } from "react-day-picker";
import { motion } from "framer-motion";

import { Race } from "@/lib/data";
import { RaceFilters } from "@/components/race-filters";
import { Countdown } from "@/components/countdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ImageWithSkeleton } from "@/components/image-with-skeleton";

interface RaceListProps {
  races: Race[];
}

export function RaceList({ races }: RaceListProps) {
  const [filters, setFilters] = useState<{
    province: string;
    type: string;
    dateRange: DateRange | undefined;
  }>({
    province: "",
    type: "",
    dateRange: undefined,
  });

  const now = new Date();
  const oneWeekAgo = subWeeks(now, 1);

  const filteredRaces = races.filter((race) => {
    const raceDate = parseISO(race.date);

    if (isBefore(raceDate, oneWeekAgo)) {
      return false;
    }

    const matchesProvince = filters.province
      ? race.province === filters.province
      : true;
    const matchesType = filters.type ? race.type === filters.type : true;

    let matchesDate = true;
    if (filters.dateRange?.from) {
      const raceDate = parseISO(race.date);
      const start = startOfDay(filters.dateRange.from);
      const end = filters.dateRange.to
        ? endOfDay(filters.dateRange.to)
        : endOfDay(filters.dateRange.from);

      matchesDate = isWithinInterval(raceDate, { start, end });
    }

    return matchesProvince && matchesType && matchesDate;
  });

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <RaceFilters filters={filters} setFilters={setFilters} />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRaces.map((race, index) => {
          const isFinished = isBefore(parseISO(race.date), now);

          return (
            <motion.div
              key={race.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Card
                className={`overflow-hidden flex flex-col h-full p-0 gap-0 pb-4 border-0 group ${
                  isFinished ? "grayscale opacity-75" : ""
                }`}
              >
                <div className="relative">
                  <AspectRatio ratio={16 / 9}>
                    <ImageWithSkeleton
                      src={
                        race.image ||
                        "https://images.unsplash.com/photo-1533560906234-8f85e186d6ea?q=80&w=1000&auto=format&fit=crop"
                      }
                      alt={race.name}
                      className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                    />
                  </AspectRatio>
                  <div className="absolute top-2 right-2 flex flex-col gap-2 items-end">
                    <Badge
                      variant={race.type === "trail" ? "default" : "secondary"}
                      className={
                        race.type === "trail"
                          ? "bg-green-600/80 hover:bg-green-700/90 border-0 text-white"
                          : "bg-white/20 hover:bg-white/30 border-white/10 text-white"
                      }
                    >
                      {race.type === "trail" ? "Trail" : "Calle"}
                    </Badge>
                  </div>
                  {race.discountCode && (
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                      <div className="absolute top-[20px] -left-[35px] w-[120px] bg-red-600 text-white text-xs font-bold text-center py-1 -rotate-45 shadow-md z-10">
                        % OFF
                      </div>
                    </div>
                  )}
                </div>

                <CardHeader className="pb-2 pt-4">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-xl leading-tight text-white">
                      {race.name}
                    </h3>
                  </div>
                  <div className="flex items-center text-white/70 text-sm mt-1">
                    <MapPin className="w-4 h-4 mr-1 text-white/50" />
                    {race.location}, {race.province}
                  </div>
                </CardHeader>

                <CardContent className="flex-grow">
                  <div className="flex items-center text-sm mb-4 text-white/90">
                    <CalendarIcon className="w-4 h-4 mr-1 text-white/50" />
                    <span className="font-medium">
                      {format(parseISO(race.date), "d 'de' MMMM, yyyy", {
                        locale: es,
                      })}
                    </span>
                  </div>

                  <div className="bg-black/20 border border-white/5 rounded-lg p-3 mb-2">
                    <div className="text-xs text-white/60 mb-1 text-center uppercase tracking-wider">
                      {isFinished ? "Estado" : "Faltan"}
                    </div>
                    <div className="flex justify-center">
                      <Countdown
                        targetDate={race.date}
                        isFinished={isFinished}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {race.distance.split(",").map((dist, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {dist.trim()}
                      </Badge>
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="pt-2">
                  <Button asChild className="w-full">
                    <Link href={`/races/${race.id}`}>
                      Ver Detalles <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filteredRaces.length === 0 && (
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground">
            No se encontraron carreras con estos filtros.
          </p>
          <Button
            variant="link"
            onClick={() =>
              setFilters({ province: "", type: "", dateRange: undefined })
            }
            className="mt-2"
          >
            Limpiar filtros
          </Button>
        </div>
      )}
    </>
  );
}
