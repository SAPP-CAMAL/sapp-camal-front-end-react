"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { DateRange as DateRangeType } from "../domain/animal-income.types";

interface DateRangePickerProps {
  dateRange: DateRangeType;
  onDateRangeChange: (range: DateRangeType) => void;
  isLoading?: boolean;
}

export function DateRangePicker({
  dateRange,
  onDateRangeChange,
  isLoading = false,
}: DateRangePickerProps) {
  const [date, setDate] = useState<DateRange | undefined>({
    from: dateRange.from,
    to: dateRange.to,
  });

  const handleSelect = (range: DateRange | undefined) => {
    setDate(range);
    if (range?.from && range?.to) {
      onDateRangeChange({
        from: range.from,
        to: range.to,
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-normal bg-slate-800/50 border-slate-700 text-white hover:bg-slate-800 hover:text-white",
              !date && "text-slate-400"
            )}
            disabled={isLoading}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-sky-400" />
            {date?.from ? (
              date.to ? (
                <>
                  <span className="text-sky-400">Personalizado:</span>
                  <span className="ml-2">
                    {format(date.from, "dd/MM/yyyy", { locale: es })} -{" "}
                    {format(date.to, "dd/MM/yyyy", { locale: es })}
                  </span>
                </>
              ) : (
                format(date.from, "dd/MM/yyyy", { locale: es })
              )
            ) : (
              <span>Seleccionar período</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-slate-900 border-slate-700" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
            locale={es}
            className="bg-slate-900 text-white"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
