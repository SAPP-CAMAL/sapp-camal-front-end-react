"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronsUpDown, Check } from "lucide-react";

interface Props {
  label?: string;
  selected: any[];
  onChange: (value: any[]) => void;
  placeholder?: string;
  className?: string;
  options: any[];
}

export function MultiSelect({
  label,
  selected,
  onChange,
  placeholder = "Seleccionar...",
  className,
  options,
}: Props) {
  const toggle = (sp: []) => {
    const exists = selected.includes(sp);
    onChange(exists ? selected.filter((s) => s !== sp) : [...selected, sp]);
  };

  const count = selected.length;

  return (
    <div className={"flex flex-col gap-1 min-w-[190px] " + (className ?? "")}>
      {label ? (
        <span className="text-xs text-muted-foreground font-medium">
          {label}
        </span>
      ) : null}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="justify-between w-full bg-muted hover:bg-muted"
          >
            <span
              className={
                count === 0
                  ? "truncate text-xs text-muted-foreground"
                  : "truncate text-sm"
              }
            >
              {count === 0 ? placeholder : `${count} seleccionadas`}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[280px]" align="start" sideOffset={4}>
          <div className="py-2">
            {options.map((op) => {
              const isChecked = selected.includes(op);
              return (
                <button
                  key={op}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
                  onClick={(e) => {
                    e.preventDefault();
                    toggle(op);
                  }}
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => toggle(op)}
                  />
                  <span className="flex-1 text-left">{op}</span>
                  {isChecked ? (
                    <Check className="h-4 w-4 text-primary" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
