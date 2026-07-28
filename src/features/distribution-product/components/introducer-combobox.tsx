"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebouncedCallback } from "use-debounce";
import { Check, ChevronsUpDown, UserIcon } from "lucide-react";
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
import { getIntroducersPaginated } from "@/features/introducer/server/db/introducer.service";
import { Introducer } from "@/features/introducer/domain/introducer";

export function IntroducerCombobox({
  value,
  onChange,
}: {
  value?: number;
  onChange: (introducer: Introducer) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Introducer | undefined>();

  const introducersQuery = useQuery({
    queryKey: ["introducers-combobox", search],
    queryFn: () =>
      getIntroducersPaginated({ fullName: search, limit: 20 }),
    enabled: open,
  });

  const debounceSearch = useDebouncedCallback(
    (text: string) => setSearch(text),
    400
  );

  const introducers = introducersQuery.data?.data?.items ?? [];

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
              <UserIcon className="h-4 w-4 shrink-0" />
              {selected.fullName} ({selected.identification})
            </span>
          ) : value ? (
            `Introductor #${value}`
          ) : (
            "Seleccione un introductor..."
          )}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Buscar por nombre..."
            onValueChange={debounceSearch}
          />
          <CommandList>
            <CommandEmpty>
              {introducersQuery.isLoading ? "Cargando..." : "Sin resultados."}
            </CommandEmpty>
            <CommandGroup>
              {introducers.map((introducer: Introducer) => (
                <CommandItem
                  key={introducer.id}
                  value={String(introducer.id)}
                  onSelect={() => {
                    onChange(introducer);
                    setSelected(introducer);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === introducer.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {introducer.fullName} ({introducer.identification})
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
