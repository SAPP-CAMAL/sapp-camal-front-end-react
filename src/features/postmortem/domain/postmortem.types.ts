/**
 * Tipos y interfaces para el manejo de inspección postmortem
 */

export type Introductor = {
  id: string;
  nombre: string;
  marca: string;
  certificado: string;
  animales: string;
  certId: number; // idSettingCertificateBrands para obtener animales
};

export type IntroductorRow = {
  id: string;
  introductor: Introductor | null;
  values: number[];
};

export type ModalState = {
  isOpen: boolean;
  rowId: string | null;
  columnIndex: number | null;
  localizacion: string;
  patologia: string;
  idSpeciesDisease?: number; // ID de la enfermedad
  idProduct?: number; // ID del producto para obtener ubicaciones anatómicas
};

export type ColumnConfig = {
  localizacion: string;
  patologia: string;
  idSpeciesDisease?: number; // ID de la enfermedad para guardar
  idProduct?: number; // ID del producto para obtener ubicaciones anatómicas
  isTotal?: boolean;
};

export type AnimalSelection = {
  animalId: string;
  selected: boolean;
  percentage: number;
  weight?: number; // Peso aproximado del órgano
  anatomicalPercentages?: Record<number, number>; // Porcentajes por ubicación anatómica (key: idLocation, value: percentage)
  anatomicalWeights?: Record<number, number>; // Pesos por ubicación anatómica (key: idLocation, value: weight)
  selectedAnatomicalLocations?: Record<number, boolean>; // Ubicaciones seleccionadas (key: idLocation, value: selected)
};
