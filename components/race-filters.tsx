"use client";

import * as React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { provinces, RaceType } from "@/lib/data";

interface RaceFiltersProps {
  filters: {
    province: string;
    type: string;
    dateRange: DateRange | undefined;
  };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      province: string;
      type: string;
      dateRange: DateRange | undefined;
    }>
  >;
}

export function RaceFilters({ filters, setFilters }: RaceFiltersProps) {
  const handleProvinceChange = (value: string) => {
    setFilters((prev) => ({ ...prev, province: value === "all" ? "" : value }));
  };

  const handleTypeChange = (value: string) => {
    setFilters((prev) => ({ ...prev, type: value === "all" ? "" : value }));
  };

  const handleDateSelect = (range: DateRange | undefined) => {
    setFilters((prev) => ({ ...prev, dateRange: range }));
  };

  const clearFilters = () => {
    setFilters({
      province: "",
      type: "",
      dateRange: undefined,
    });
  };

  const hasActiveFilters =
    filters.province || filters.type || filters.dateRange;

  return (
    <div className="glass-panel p-4 rounded-2xl flex flex-col gap-4 md:flex-row md:items-center md:flex-wrap">
      {/* Province Filter */}
      <Select
        value={filters.province || "all"}
        onValueChange={handleProvinceChange}
      >
        <SelectTrigger className="w-full md:w-[200px] glass-input border-white/10 text-white">
          <SelectValue placeholder="Provincia" />
        </SelectTrigger>
        <SelectContent className="glass-panel border-neutral-700 text-white bg-neutral-900">
          <SelectItem value="all">Todas las provincias</SelectItem>
          {provinces.map((province) => (
            <SelectItem key={province} value={province}>
              {province}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Type Filter */}
      <Select value={filters.type || "all"} onValueChange={handleTypeChange}>
        <SelectTrigger className="w-full md:w-[180px] glass-input border-white/10 text-white">
          <SelectValue placeholder="Modalidad" />
        </SelectTrigger>
        <SelectContent className="glass-panel border-neutral-700 text-white bg-neutral-900">
          <SelectItem value="all">Todas las modalidades</SelectItem>
          <SelectItem value="road">Calle</SelectItem>
          <SelectItem value="trail">Trail</SelectItem>
        </SelectContent>
      </Select>

      {/* Date Range Filter */}
      <div className="grid gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-full md:w-[300px] justify-start text-left font-normal glass-input border-white/10 text-white hover:bg-white/10 hover:text-white",
                !filters.dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.dateRange?.from ? (
                filters.dateRange.to ? (
                  <>
                    {format(filters.dateRange.from, "LLL dd, y", {
                      locale: es,
                    })}{" "}
                    -{" "}
                    {format(filters.dateRange.to, "LLL dd, y", { locale: es })}
                  </>
                ) : (
                  format(filters.dateRange.from, "LLL dd, y", { locale: es })
                )
              ) : (
                <span>Seleccionar fechas</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0 glass-panel border-neutral-700 bg-neutral-900"
            align="start"
          >
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={filters.dateRange?.from}
              selected={filters.dateRange}
              onSelect={handleDateSelect}
              numberOfMonths={2}
              className="text-white"
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          onClick={clearFilters}
          className="h-8 px-2 lg:px-3 text-white/70 hover:text-white hover:bg-white/10"
        >
          Limpiar
          <X className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
