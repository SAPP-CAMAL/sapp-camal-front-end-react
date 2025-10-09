"use client";
import * as React from "react";
import { DayPicker, type DayPickerProps } from "react-day-picker";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker> &
  DayPickerProps;

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const weekday2 = (date: Date) => {
    const short = date.toLocaleDateString("es-ES", { weekday: "short" });
    const map: Record<string, string> = {
      dom: "do",
      lun: "lu",
      mar: "ma",
      mié: "mi",
      jue: "ju",
      vie: "vi",
      sáb: "sá",
    };
    return map[short] ?? short.slice(0, 2);
  };

  const formatCaption = (month: Date) =>
    month.toLocaleDateString("es-ES", { month: "long", year: "numeric" });

  const isSameDate = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  return (
    <DayPicker
      weekStartsOn={0}
      // Modificador personalizado para desplazar solo los días (no el 'today')
      modifiers={{
        shifted: (date) => !isSameDate(date, new Date()),
      }}
          // 👇 Hoy SIEMPRE negro (gana a hover/selected al ser inline style)
      modifiersStyles={{
        today: {
          backgroundColor: "black",
          color: "white",
          borderRadius: "0.375rem", // ~ rounded-md
          alignContent: "center",
        },
        // Forzar que los días fuera del mes se vean grises
        outside: {
          color: "#9ca3af", // gray-400
          opacity: 0.6,
        },
        // Desplaza solo los días con el modificador 'shifted'
        shifted: {
          transform: "translateX(3px)",
        },
      }}
      modifiersClassNames={{
        today: "day_today",
        selected: "day_selected",
        disabled: "day_disabled",
        range_middle: "day_range_middle",
        outside: "day_outside",
      }}
      showOutsideDays={showOutsideDays}
      fixedWeeks
      formatters={{
        formatWeekdayName: weekday2,
        formatCaption,
      }}
      className={cn("p-3", className)}
      classNames={{
        // Contenedor y mes centrados
        months: "flex flex-col items-center space-y-4",
        month: "space-y-3 w-auto loading-none",

        // Caption con flechas a los lados
        caption: "relative flex items-center w-full mb-4", // flex y relative para posicionar label y flechas
        caption_label:
          "absolute left-0 right-0 top-1/12 -translate-y-1/2 text-center text-sm font-medium capitalize", // label centrado horizontal y verticalmente
        nav: "flex items-center w-full justify-between", // flechas a los lados
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "", // sin margen extra
        nav_button_next: "", // sin margen extra

        // Header y filas con grid de 7 columnas
        table: "border-collapse mx-auto",
        head_row: "flex justify-between w-fit mx-auto",
        head_cell:
          "text-muted-foreground font-normal text-[0.8rem] h-9 w-9 flex items-center justify-center",

        row: "flex justify-between w-fit mx-auto mt-1",
        cell:
          "relative p-0 text-center text-sm w-9 h-9 flex items-center justify-center " +
          "[&:has([aria-selected])]:bg-accent " +
          "[&:has([aria-selected].day-outside)]:bg-accent/50 " +
          "[&:has([aria-selected].day-range-end)]:rounded-r-md " +
          "first:[&:has([aria-selected])]:rounded-l-md " +
          "last:[&:has([aria-selected])]:rounded-r-md",

  // Estilo base del día (el desplazamiento se aplica inline via styles.day)
  day: "h-9 w-9 p-0 font-normal hover:bg-accent hover:text-accent-foreground",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today:
          "!bg-black !text-white font-semibold rounded-md " +
          "hover:!bg-black hover:!text-white " +
          "aria-selected:!bg-black aria-selected:!text-white " +
          "focus:!bg-black focus:!text-white " +
          "justify-center items-center inline-block",
        // Días fuera del mes en gris y un poco más atenuados
        day_outside:
          "day-outside text-gray-400 opacity-60 " +
          "aria-selected:bg-accent/50 aria-selected:text-gray-400",
        day_disabled: "text-muted-foreground opacity-100",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",

        ...classNames,
      }}
      {...props}
    />
  );
}
