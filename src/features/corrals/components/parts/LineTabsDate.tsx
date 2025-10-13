"use client";
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { LineaType } from "../../domain";

interface Props {
  selectedTab: LineaType;
  onTabChange: (v: LineaType) => void;
  selectedDate: Date;
  onDateChange: (d: Date) => void;
}

const defaultStyles = 'px-2 py-1 text-sm text-gray-500 data-[state=active]:text-white data-[state=active]:bg-primary';


export function LineTabsDate({ selectedTab, onTabChange, selectedDate, onDateChange }: Props) {
  const formatForInput = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const parseFromInput = (value: string): Date | null => {
    if (!value) return null;
    const [y, m, d] = value.split("-").map((v) => parseInt(v, 10));
    if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
    return new Date(y, (m as number) - 1, d as number);
  };

  // Hidden input ref to open the native date picker when clicking the pretty button
  const hiddenDateInputRef = React.useRef<HTMLInputElement | null>(null);
  const openNativePicker = () => {
    hiddenDateInputRef.current?.showPicker?.();
    // Fallback for browsers without showPicker
    if (!hiddenDateInputRef.current?.showPicker && hiddenDateInputRef.current) {
      hiddenDateInputRef.current.click();
    }
  };

  const getLineLabel = (value: LineaType) => {
    switch (value) {
      case "bovinos":
        return "Línea 1 (Bovinos)";
      case "porcinos":
        return "Línea 2 (Porcinos)";
      case "ovinos-caprinos":
        return "Línea 3 (Ovinos-Caprinos)";
    }
  };

  return (
    <>
      {/* Mobile layout */}
      <div className="lg:hidden space-y-4">
        {/* Line selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Línea de producción:</label>
          <Select value={selectedTab} onValueChange={(value: LineaType) => onTabChange(value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona una línea" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bovinos">Línea 1 (Bovinos)</SelectItem>
              <SelectItem value="porcinos">Línea 2 (Porcinos)</SelectItem>
              <SelectItem value="ovinos-caprinos">Línea 3 (Ovinos-Caprinos)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Fecha:</label>
          {/* Hidden native input to keep native picker behavior */}
          <Input
            ref={hiddenDateInputRef}
            type="date"
            value={formatForInput(selectedDate)}
            onChange={(e) => {
              const d = parseFromInput(e.target.value);
              if (d) onDateChange(d);
            }}
            className="sr-only"
            aria-hidden
            tabIndex={-1}
          />
          {/* Pretty button showing formatted date in Spanish */}
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start gap-2 text-sm"
            onClick={openNativePicker}
          >
            <CalendarIcon className="h-4 w-4" />
            <span>{format(selectedDate, "EEEE, d 'de' MMMM, yyyy", { locale: es })}</span>
          </Button>
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden lg:flex items-center justify-center">
        <div className="flex items-center gap-6">
          <Tabs value={selectedTab} onValueChange={(value: string) => onTabChange(value as LineaType)}>
            <TabsList className="grid w-fit grid-cols-3 h-14 gap-2">
              <TabsTrigger value="bovinos" className={defaultStyles}>Línea 1 (Bovinos)</TabsTrigger>
              <TabsTrigger value="porcinos" className={defaultStyles}>Línea 2 (Porcinos)</TabsTrigger>
              <TabsTrigger value="ovinos-caprinos" className={defaultStyles}>Línea 3 (Ovinos-Caprinos)</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Fecha:</span>
            {/* Hidden native input to keep native picker behavior */}
            <Input
              ref={hiddenDateInputRef}
              type="date"
              value={formatForInput(selectedDate)}
              onChange={(e) => {
                const d = parseFromInput(e.target.value);
                if (d) onDateChange(d);
              }}
              className="sr-only"
              aria-hidden
              tabIndex={-1}
            />
            <Button
              type="button"
              variant="outline"
              className="flex items-center gap-1 text-sm"
              onClick={openNativePicker}
            >
              <CalendarIcon className="h-4 w-4" />
              <span>{format(selectedDate, "EEEE, d 'de' MMMM, yyyy", { locale: es })}</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
