"use client";

import { useMemo } from "react";
import { CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductiveStage } from "@/features/productive-stage/domain";
import { Specie } from "@/features/specie/domain";

import {
  CODE_ENTRY_SHORT_HINT,
  getCodeEntryMode,
  getSpeciesPresentation,
} from "../constants";

type SpeciesGroup = {
  idSpecies: number;
  name: string;
  hint: string;
  order: number;
  stages: ProductiveStage[];
};

interface StageSelectorProps {
  stages: ProductiveStage[];
  species: Specie[];
  selectedStageId: number | null;
  onSelect: (stage: ProductiveStage) => void;
  isLoading?: boolean;
}

export function StageSelector({
  stages,
  species,
  selectedStageId,
  onSelect,
  isLoading,
}: StageSelectorProps) {
  const groups = useMemo<SpeciesGroup[]>(() => {
    const speciesNameById = new Map(species.map((item) => [item.id, item.name]));
    const bySpecies = new Map<number, ProductiveStage[]>();

    for (const stage of stages) {
      if (!stage.status) continue;
      const current = bySpecies.get(stage.idSpecies);
      if (current) {
        current.push(stage);
      } else {
        bySpecies.set(stage.idSpecies, [stage]);
      }
    }

    return Array.from(bySpecies.entries())
      .map(([idSpecies, groupStages]) => ({
        idSpecies,
        name: speciesNameById.get(idSpecies) ?? `Especie ${idSpecies}`,
        hint: CODE_ENTRY_SHORT_HINT[getCodeEntryMode(idSpecies)],
        order: getSpeciesPresentation(idSpecies).order,
        stages: groupStages.sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
  }, [stages, species]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[0, 1].map((group) => (
          <div key={group} className="space-y-3">
            <Skeleton className="h-5 w-40" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {[0, 1, 2, 3].map((card) => (
                <Skeleton key={card} className="h-20" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No hay etapas productivas activas para registrar tickets.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => {
        const { icon: Icon, iconClass } = getSpeciesPresentation(group.idSpecies);

        return (
          <section key={group.idSpecies} className="space-y-3">
            <header className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <Icon className={cn("h-5 w-5 shrink-0", iconClass)} />
              <h3 className="text-sm font-semibold uppercase tracking-wide">
                {group.name}
              </h3>
              <span className="text-xs text-muted-foreground">· {group.hint}</span>
            </header>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {group.stages.map((stage) => {
                const isSelected = stage.id === selectedStageId;

                return (
                  <button
                    key={stage.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => onSelect(stage)}
                    className={cn(
                      "relative flex min-h-20 items-center justify-center rounded-xl border-2 p-3 text-center transition-colors",
                      "hover:border-primary/60 hover:bg-primary/5",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card"
                    )}
                  >
                    {isSelected && (
                      <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <CheckIcon className="h-3 w-3" />
                      </span>
                    )}
                    <span
                      className={cn(
                        "text-sm font-semibold leading-tight uppercase",
                        isSelected ? "text-primary" : "text-foreground"
                      )}
                    >
                      {stage.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
