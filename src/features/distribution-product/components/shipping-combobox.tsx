"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, TruckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getShippersByFilterService } from "@/features/shipping/server/db/shipping.service";

export function ShippingCombobox({
  value,
  onChange,
}: {
  value?: number;
  onChange: (id: number) => void;
}) {
  const [open, setOpen] = useState(false);

  const shippingsQuery = useQuery({
    queryKey: ["shippings-combobox"],
    queryFn: () => getShippersByFilterService({ limit: 100 }),
  });

  const shippings = shippingsQuery.data?.data?.items ?? [];
  const selected = shippings.find((s) => s.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {selected ? (
            <span className="flex items-center gap-2 truncate">
              <TruckIcon className="h-4 w-4 shrink-0" />
              {selected.vehicle?.plate} — {selected.person?.fullName}
            </span>
          ) : (
            "Seleccione un envío..."
          )}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput placeholder="Buscar por placa o conductor..." />
          <CommandList>
            <CommandEmpty>
              {shippingsQuery.isLoading ? "Cargando..." : "Sin resultados."}
            </CommandEmpty>
            <CommandGroup>
              {shippings.map((shipping) => (
                <CommandItem
                  key={shipping.id}
                  value={`${shipping.vehicle?.plate} ${shipping.person?.fullName}`}
                  onSelect={() => {
                    onChange(shipping.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === shipping.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {shipping.vehicle?.plate} — {shipping.person?.fullName}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
