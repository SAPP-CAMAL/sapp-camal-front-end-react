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
  animalCode: string;
  adverseSituation: string;
  diseaseComment: string;
  selected: boolean;
  percentage: number;
  weight?: number; // Peso aproximado del órgano
  anatomicalPercentages?: Record<number, number>; // Porcentajes por ubicación anatómica (key: idLocation, value: percentage)
  anatomicalWeights?: Record<number, number>; // Pesos por ubicación anatómica (key: idLocation, value: weight)
  selectedAnatomicalLocations?: Record<number, boolean>; // Ubicaciones seleccionadas (key: idLocation, value: selected)
  anatomicalAdverseSituations?: Record<number, string>; // Situaciones adversas por ubicación anatómica (key: idLocation, value: adverseSituation)
  anatomicalDiseaseComment?: Record<number, string>; // Comentarios de enfermedad por ubicación anatómica (key: idLocation, value: diseaseComment)
  anatomicalImageFiles?: Record<number, File | null>; // Archivos de imagen por ubicación anatómica (key: idLocation, value: file)
  anatomicalImagePreviews?: Record<number, string | null>; // Previews de imagen por ubicación anatómica (key: idLocation, value: preview)
  imageFile?: File | null;
  imagePreview?: string | null;
  existingImageUrl?: string | null;
};
