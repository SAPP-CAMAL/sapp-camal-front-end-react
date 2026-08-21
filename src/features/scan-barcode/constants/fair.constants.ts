import { Beef, Ham, PawPrint, type LucideIcon } from "lucide-react";

export const SPECIES_ID = {
  CAPRINO: 1,
  OVINO: 2,
  PORCINO: 3,
  BOVINO: 4,
} as const;

/**
 * Los bovinos y porcinos llegan a la feria con el ticket original impreso; el
 * resto de especies no, y se les genera un código con prefijo SG.
 */
export type CodeEntryMode = "scan-or-generate" | "scan-only" | "generate-only";

export function getCodeEntryMode(idSpecies: number): CodeEntryMode {
  if (idSpecies === SPECIES_ID.PORCINO) return "scan-or-generate";
  if (idSpecies === SPECIES_ID.BOVINO) return "scan-only";
  return "generate-only";
}

export const CODE_ENTRY_HINT: Record<CodeEntryMode, string> = {
  "scan-or-generate": "Escaneá el ticket original o generá un código nuevo",
  "scan-only": "Escaneá el ticket original con el lector",
  "generate-only": "No traen ticket original: generá el código",
};

export const CODE_ENTRY_SHORT_HINT: Record<CodeEntryMode, string> = {
  "scan-or-generate": "escanear o generar",
  "scan-only": "llega con ticket, escanear",
  "generate-only": "generar código",
};

type SpeciesPresentation = {
  icon: LucideIcon;
  iconClass: string;
  order: number;
};

export const SPECIES_PRESENTATION: Record<number, SpeciesPresentation> = {
  [SPECIES_ID.BOVINO]: { icon: Beef, iconClass: "text-amber-600", order: 1 },
  [SPECIES_ID.PORCINO]: { icon: Ham, iconClass: "text-rose-500", order: 2 },
  [SPECIES_ID.OVINO]: { icon: PawPrint, iconClass: "text-sky-600", order: 3 },
  [SPECIES_ID.CAPRINO]: { icon: PawPrint, iconClass: "text-violet-600", order: 4 },
};

export const DEFAULT_SPECIES_PRESENTATION: SpeciesPresentation = {
  icon: PawPrint,
  iconClass: "text-muted-foreground",
  order: 99,
};

export function getSpeciesPresentation(idSpecies: number): SpeciesPresentation {
  return SPECIES_PRESENTATION[idSpecies] ?? DEFAULT_SPECIES_PRESENTATION;
}

export const FAIR_PRODUCTIVE_STAGES_TAG = "fair-productive-stages";
