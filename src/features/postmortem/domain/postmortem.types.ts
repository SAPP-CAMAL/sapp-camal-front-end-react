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
};

export type ColumnConfig = {
  localizacion: string;
  patologia: string;
  isTotal?: boolean;
};

export type AnimalSelection = {
  animalId: string;
  selected: boolean;
  percentage: number;
};
