export type Linea = "Bovinos" | "Porcinos" | "Ovinos Caprinos";

// Re-export line types for convenience
export * from './line.types';

// Interfaz para marca con su información completa
export interface MarcaInfo {
  label: string; // Etiqueta como "ESP 6H 3M"
  settingCertificateBrandsId: number; // ID para cargar animales
}

export interface AntemortemRow {
  statusCorralId?: number; // ID del status corral para actualizar argollas
  corral: string;
  marcas: string[]; // Etiquetas como "ESP 6H 3M" (para compatibilidad)
  marcasInfo?: MarcaInfo[]; // Información completa de las marcas
  observaciones?: string;
  argollas?: number; // Solo aplica para Bovinos
  total: number; // machos + hembras
  machos: number;
  hembras: number;
  haveObservations?: boolean; // Indica si tiene observaciones guardadas (para mostrar/ocultar botón)
}

export interface AntemortemDataSet {
  fecha: Date;
  linea: Linea;
  filas: AntemortemRow[];
}

const today = new Date();
const sameDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

export const DATASET: Record<Linea, AntemortemDataSet> = {
  Bovinos: {
    fecha: sameDate,
    linea: "Bovinos",
    filas: [
      // 13 corrales incluyendo Emergencia
      { corral: "Emergencia", marcas: ["EMER 2H 1M"], observaciones: "Sin observaciones", argollas: 2, total: 3, machos: 2, hembras: 1 },
      { corral: "Corral 1", marcas: ["SD 1H 3M", "RT 2H 3M"], observaciones: "Sin observaciones", argollas: 0, total: 9, machos: 5, hembras: 4 },
      { corral: "Corral 2", marcas: ["REF 2H 2M"], observaciones: "Sin observaciones", argollas: 1, total: 6, machos: 3, hembras: 3 },
      { corral: "Corral 3", marcas: ["VFR 3H 2M", "NORM 1H 1M"], observaciones: "Sin observaciones", argollas: 0, total: 7, machos: 4, hembras: 3 },
      { corral: "Corral 4", marcas: ["ESP 2H 1M"], observaciones: "Sin observaciones", argollas: 0, total: 3, machos: 2, hembras: 1 },
      { corral: "Corral 5", marcas: ["COM 2H 2M"], observaciones: "Sin observaciones", argollas: 0, total: 6, machos: 3, hembras: 3 },
      { corral: "Corral 6", marcas: ["RT 2H 1M"], observaciones: "Sin observaciones", argollas: 0, total: 3, machos: 2, hembras: 1 },
      { corral: "Corral 7", marcas: ["SD 2H 2M"], observaciones: "Sin observaciones", argollas: 0, total: 6, machos: 4, hembras: 2 },
      { corral: "Corral 8", marcas: ["REF 1H 2M", "ESP 1H 0M"], observaciones: "Sin observaciones", argollas: 0, total: 4, machos: 2, hembras: 2 },
      { corral: "Corral 9", marcas: ["NORM 3H 3M"], observaciones: "Sin observaciones", argollas: 0, total: 6, machos: 3, hembras: 3 },
      { corral: "Corral 10", marcas: ["VFR 2H 2M"], observaciones: "Sin observaciones", argollas: 0, total: 4, machos: 2, hembras: 2 },
      { corral: "Corral 11", marcas: ["COM 3H 2M"], observaciones: "Sin observaciones", argollas: 0, total: 5, machos: 3, hembras: 2 },
      { corral: "Corral 12", marcas: ["ESP 2H 2M", "RT 1H 1M"], observaciones: "Sin observaciones", argollas: 0, total: 6, machos: 3, hembras: 3 },
    ],
  },
  Porcinos: {
    fecha: sameDate,
    linea: "Porcinos",
    filas: [
      // 13 corrales incluyendo Emergencia
      { corral: "Emergencia", marcas: ["EMER 1H 2M"], observaciones: "Sin observaciones", total: 3, machos: 1, hembras: 2 },
      { corral: "Corral 1", marcas: ["REF 4H 4M"], observaciones: "Sin observaciones", total: 8, machos: 4, hembras: 4 },
      { corral: "Corral 2", marcas: ["ESP 5H 4M"], observaciones: "Sin observaciones", total: 9, machos: 5, hembras: 4 },
      { corral: "Corral 3", marcas: ["NORM 3H 2M"], observaciones: "Sin observaciones", total: 5, machos: 3, hembras: 2 },
      { corral: "Corral 4", marcas: ["ALT 2H 3M"], observaciones: "Sin observaciones", total: 5, machos: 2, hembras: 3 },
      { corral: "Corral 5", marcas: ["ESP 2H 2M"], observaciones: "Sin observaciones", total: 4, machos: 2, hembras: 2 },
      { corral: "Corral 6", marcas: ["REF 3H 3M"], observaciones: "Sin observaciones", total: 6, machos: 3, hembras: 3 },
      { corral: "Corral 7", marcas: ["NORM 2H 2M"], observaciones: "Sin observaciones", total: 4, machos: 2, hembras: 2 },
      { corral: "Corral 8", marcas: ["ESP 1H 3M"], observaciones: "Sin observaciones", total: 4, machos: 1, hembras: 3 },
      { corral: "Corral 9", marcas: ["REF 2H 2M"], observaciones: "Sin observaciones", total: 4, machos: 2, hembras: 2 },
      { corral: "Corral 10", marcas: ["NORM 3H 1M"], observaciones: "Sin observaciones", total: 4, machos: 3, hembras: 1 },
      { corral: "Corral 11", marcas: ["ESP 2H 1M"], observaciones: "Sin observaciones", total: 3, machos: 2, hembras: 1 },
      { corral: "Corral 12", marcas: ["ALT 2H 2M"], observaciones: "Sin observaciones", total: 4, machos: 2, hembras: 2 },
    ],
  },
  "Ovinos Caprinos": {
    fecha: sameDate,
    linea: "Ovinos Caprinos",
    filas: [
      // 13 corrales incluyendo Emergencia
      { corral: "Emergencia", marcas: ["EMER 1H 1M"], observaciones: "Sin observaciones", total: 2, machos: 1, hembras: 1 },
      { corral: "Corral 1", marcas: ["ALT 2H 2M"], observaciones: "Sin observaciones", total: 4, machos: 2, hembras: 2 },
      { corral: "Corral 2", marcas: ["NORM 1H 2M"], observaciones: "Sin observaciones", total: 3, machos: 1, hembras: 2 },
      { corral: "Corral 3", marcas: ["ESP 2H 1M"], observaciones: "Sin observaciones", total: 3, machos: 2, hembras: 1 },
      { corral: "Corral 4", marcas: ["REF 2H 2M"], observaciones: "Sin observaciones", total: 4, machos: 2, hembras: 2 },
      { corral: "Corral 5", marcas: ["ALT 1H 2M"], observaciones: "Sin observaciones", total: 3, machos: 1, hembras: 2 },
      { corral: "Corral 6", marcas: ["NORM 2H 1M"], observaciones: "Sin observaciones", total: 3, machos: 2, hembras: 1 },
      { corral: "Corral 7", marcas: ["ESP 1H 2M"], observaciones: "Sin observaciones", total: 3, machos: 1, hembras: 2 },
      { corral: "Corral 8", marcas: ["REF 1H 1M"], observaciones: "Sin observaciones", total: 2, machos: 1, hembras: 1 },
      { corral: "Corral 9", marcas: ["ALT 2H 1M"], observaciones: "Sin observaciones", total: 3, machos: 2, hembras: 1 },
      { corral: "Corral 10", marcas: ["NORM 1H 1M"], observaciones: "Sin observaciones", total: 2, machos: 1, hembras: 1 },
      { corral: "Corral 11", marcas: ["ESP 2H 2M"], observaciones: "Sin observaciones", total: 4, machos: 2, hembras: 2 },
      { corral: "Corral 12", marcas: ["REF 2H 1M"], observaciones: "Sin observaciones", total: 3, machos: 2, hembras: 1 },
    ],
  },
};

export function computeTotals(rows: AntemortemRow[]) {
  return rows.reduce(
    (acc, r) => {
      acc.total += r.total;
      acc.machos += r.machos;
      acc.hembras += r.hembras;
      acc.argollas += r.argollas ?? 0;
      return acc;
    },
    { total: 0, machos: 0, hembras: 0, argollas: 0 }
  );
}
