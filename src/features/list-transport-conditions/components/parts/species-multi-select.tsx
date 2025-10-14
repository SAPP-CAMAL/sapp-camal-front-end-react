"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronsUpDown, Check, X, ChevronRight } from "lucide-react";
import { Species } from "../../domain";
import { useState } from "react";

interface Props {
  label?: string;
  selected: Species[];
  onSelect: (value: Species[]) => void;
  speciesList: Species[];
  placeholder?: string;
  className?: string;
  hasSubItems?: boolean; // Nueva prop para indicar si tiene subitems
}

export function SpeciesMultiSelect({ 
  label, 
  selected, 
  onSelect, 
  speciesList,
  placeholder = "Seleccionar especie...", 
  className,
  hasSubItems = false
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (sp: Species) => {
    const newSelection = selected.includes(sp) ? [] : [sp];
    onSelect(newSelection);
    setIsOpen(false);
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect([]);
    setIsOpen(false);
  };

  const selectedSpecies = selected[0] || null;
  const isPorcinoSelected = selectedSpecies === "PORCINO";

  return (
    <div className={"flex flex-col gap-1 min-w-[190px] " + (className ?? "")}>
      {label ? (
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
      ) : null}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className={`justify-between w-full bg-muted hover:bg-muted ${isPorcinoSelected && hasSubItems ? 'border-primary/50 bg-primary/5' : ''}`}
          >
            <div className="flex items-center gap-2">
              <span className={!selectedSpecies ? "truncate text-xs text-muted-foreground" : "truncate text-sm"}>
                {selectedSpecies || placeholder}
              </span>
              {isPorcinoSelected && hasSubItems && (
                <ChevronRight className="h-3 w-3 text-primary" />
              )}
            </div>
            <div className="flex items-center gap-1">
              {selectedSpecies && (
                <div 
                  role="button"
                  tabIndex={0}
                  className="h-4 w-4 opacity-50 hover:opacity-100 flex items-center justify-center focus:outline-none"
                  onClick={clearSelection}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      clearSelection(e as any);
                    }
                  }}
                  aria-label="Limpiar selección"
                >
                  <X className="h-3 w-3" />
                </div>
              )}
              <ChevronsUpDown className="h-4 w-4 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[280px]" align="start" sideOffset={4}>
          <div className="py-2 max-h-[300px] overflow-y-auto">
            {speciesList.map((sp) => {
              const isChecked = selected.includes(sp);
              const isPorcino = sp === "PORCINO";
              return (
                <div
                  key={sp}
                  role="button"
                  tabIndex={0}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent cursor-pointer ${isPorcino && hasSubItems ? 'bg-primary/5 border-l-2 border-primary/30' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleSelect(sp);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelect(sp);
                    }
                  }}
                >
                  <div className={`h-4 w-4 rounded-full border ${isChecked ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
                    {isChecked && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <span className="flex-1 text-left">{sp}</span>
                  {isPorcino && hasSubItems && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span>tiene opciones</span>
                      <ChevronRight className="h-3 w-3" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
