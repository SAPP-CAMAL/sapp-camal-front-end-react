"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProductiveStage } from "@/features/productive-stage/domain";

import { getSpeciesPresentation } from "../constants";

interface ActiveStageBarProps {
  stage: ProductiveStage;
  speciesName: string;
  onChange: () => void;
}

export function ActiveStageBar({ stage, speciesName, onChange }: ActiveStageBarProps) {
  const { icon: Icon, iconClass } = getSpeciesPresentation(stage.idSpecies);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-primary bg-primary/10 p-3 sm:p-4">
      <div className="flex min-w-0 items-center gap-3">
        <Icon className={cn("h-6 w-6 shrink-0", iconClass)} />
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Registrando como</p>
          <p className="truncate text-base font-semibold uppercase text-primary">
            {speciesName} · {stage.name}
          </p>
        </div>
      </div>
      <Button type="button" variant="outline" onClick={onChange} className="shrink-0">
        Cambiar
      </Button>
    </div>
  );
}
