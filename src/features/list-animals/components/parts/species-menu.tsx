"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Check } from "lucide-react";
import { Species, Specie, FinishType } from "../../domain";

interface Props {
  label?: string;
  selected: Species[];
  selectedFinishType: number | null;
  onSelectSpecies: (value: Species[]) => void;
  onSelectFinishType: (value: number | null) => void;
  speciesList: Specie[];
  placeholder?: string;
  className?: string;
}

export function SpeciesMenu({ 
  label, 
  selected, 
  selectedFinishType,
  onSelectSpecies, 
  onSelectFinishType,
  speciesList,
  placeholder = "Seleccionar especie...", 
  className 
}: Props) {
  const selectedSpecies = selected[0] || null;
  
  // Encontrar la especie PORCINO y sus finish types
  const porcinoSpecie = speciesList.find(specie => 
    specie.id === 3 || 
    specie.name.toUpperCase().includes('PORCINO') || 
    specie.name.toUpperCase().includes('CERDO')
  );
  
  const availableFinishTypes = porcinoSpecie?.finishType || [];

  const handleSpeciesSelect = (speciesName: Species) => {
    // Si la especie ya está seleccionada, deseleccionar
    if (selected.includes(speciesName)) {
      onSelectSpecies([]);
      onSelectFinishType(null);
    } else {
      onSelectSpecies([speciesName]);
      if (speciesName !== "PORCINO") {
        onSelectFinishType(null);
      }
    }
  };

  const handleFinishTypeSelect = (finishTypeId: number | null) => {
    onSelectFinishType(finishTypeId);
  };

  const getDisplayText = () => {
    if (!selectedSpecies) return placeholder;
    
    if (selectedSpecies === "PORCINO" && selectedFinishType) {
      const finishType = availableFinishTypes.find(ft => ft.id === selectedFinishType);
      return `${selectedSpecies} • ${finishType?.name || 'Tipo desconocido'}`;
    }
    
    if (selectedSpecies === "PORCINO" && !selectedFinishType) {
      return `${selectedSpecies} • Todos los tipos`;
    }
    
    return selectedSpecies;
  };

  return (
    <div className={"flex flex-col gap-1 min-w-[190px] " + (className ?? "")}>
      {label ? (
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
      ) : null}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className={`justify-between w-full hover:bg-muted text-left ${
              selectedSpecies === "PORCINO" ? 'border-primary/50 bg-primary/5' : ''
            }`}
          >
            <span className={!selectedSpecies ? "truncate text-xs text-muted-foreground" : "truncate text-sm"}>
              {getDisplayText()}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="w-[280px]" align="start">
          {selectedSpecies && (
            <>
              <DropdownMenuItem 
                onClick={() => {
                  onSelectSpecies([]);
                  onSelectFinishType(null);
                }}
                className="text-muted-foreground"
              >
                Limpiar selección
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          
          {speciesList.map((specie) => {
            const isSelected = selected.includes(specie.name as Species);
            const isPorcino = specie.name.toUpperCase().includes('PORCINO');
            
            // Si es PORCINO y tiene finish types, mostrar como submenu
            if (isPorcino && availableFinishTypes.length > 0) {
              return (
                <DropdownMenuSub key={specie.id}>
                  <DropdownMenuSubTrigger className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-4 w-4 rounded-full border ${isSelected ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
                        {isSelected && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <span>{specie.name}</span>
                      <span className="text-xs text-muted-foreground ml-1">({availableFinishTypes.length} tipos)</span>
                    </div>
                  </DropdownMenuSubTrigger>
                  
                  <DropdownMenuSubContent>
                    {/* Opción para seleccionar PORCINO sin tipo específico */}
                    <DropdownMenuItem 
                      onClick={() => handleSpeciesSelect(specie.name as Species)}
                      className="flex items-center gap-2"
                    >
                      <div className={`h-4 w-4 rounded-full border ${isSelected && !selectedFinishType ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
                        {isSelected && !selectedFinishType && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <span>Todos los tipos</span>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    {/* Tipos de acabado específicos */}
                    {availableFinishTypes.map((finishType) => (
                      <DropdownMenuItem 
                        key={finishType.id}
                        onClick={() => {
                          onSelectSpecies([specie.name as Species]);
                          handleFinishTypeSelect(finishType.id);
                        }}
                        className="flex items-center gap-2"
                      >
                        <div className={`h-4 w-4 rounded-full border ${isSelected && selectedFinishType === finishType.id ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
                          {isSelected && selectedFinishType === finishType.id && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <span>{finishType.name}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              );
            } else {
              return (
                <DropdownMenuItem 
                  key={specie.id}
                  onClick={() => handleSpeciesSelect(specie.name as Species)}
                  className="flex items-center gap-2"
                >
                  <div className={`h-4 w-4 rounded-full border ${isSelected ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
                    {isSelected && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <span>{specie.name}</span>
                </DropdownMenuItem>
              );
            }
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}