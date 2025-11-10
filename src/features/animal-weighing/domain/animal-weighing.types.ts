/**
 * Tipos para el pesaje de animales en diferentes etapas
 */

export type ProductType = "CANAL" | "MEDIA_CANAL";

export type WeighingStage = "ANTE" | "POST" | "DIST";

export type AnimalWeighingFilters = {
  slaughterDate: string;
  idSpecies: number;
  productType: ProductType;
  weighingStage: WeighingStage;
  selectedHooks: number[];
};

export type AnimalWeighingRow = {
  id: string;
  animalId: number; // ID del animal de la API
  code: string; // Código del animal
  producto: string; // Sexo + Etapa productiva
  peso: number; // Peso actual (puede ser capturado o guardado)
  savedWeight: number; // Peso guardado en la BD
  fechaIngreso: string; // Fecha de ingreso
  idDetailsCertificateBrands: number;
  idAnimalSex: number;
  sectionCode?: string; // Código de la sección (ej: "A1", "B2")
  sectionDescription?: string; // Descripción de la sección
  idChannelSection?: number; // ID de la sección de canal
  idAnimalWeighing?: number; // ID del registro de pesaje para actualizar
  isComplete?: boolean; // Si el animal tiene todas sus secciones pesadas
};

export type DetailAnimalWeighing = {
  idHookType: number;
  idUnitMeasure: number; // ID de la unidad de medida (lb, kg, etc.)
  idConfigSectionChannel?: number; // Opcional, solo cuando hay secciones
  grossWeight: number; // Peso bruto de la balanza
  netWeight: number; // Peso neto (grossWeight - peso del gancho)
};

export type SaveAnimalWeighingRequest = {
  idWeighingStage: number;
  idDetailsSpeciesCertificate: number;
  idSpecie: number;
  observation?: string;
  detailsAnimalWeighing: DetailAnimalWeighing[];
};

export type UpdateAnimalWeighingRequest = {
  idWeighingStage: number;
  idSpecie: number;
  detailsAnimalWeighing: DetailAnimalWeighing[];
};

export type GetAnimalWeighingRequest = {
  slaughterDate: string;
  idSpecie: number;
  idWeighingStage: number;
};

// Tipos para la respuesta de la API
export type AnimalSex = {
  id: number;
  name: string;
};

export type ProductiveStage = {
  id: number;
  name: string;
};

export type CorralType = {
  id: number;
  description: string;
  code: string;
};

export type DetailsCertificateBrand = {
  createdAt: string;
  id: number;
  corralType: CorralType;
};

export type DetailCertificateBrands = {
  id: number;
  productiveStage: ProductiveStage;
  detailsCertificateBrand: DetailsCertificateBrand;
};

export type AnimalDetail = {
  id: number;
  idDetailsCertificateBrands: number;
  idAnimalSex: number;
  code: string;
  status: boolean;
  animalSex: AnimalSex;
  detailCertificateBrands: DetailCertificateBrands;
  animalWeighing?: any[]; // Pesos guardados del animal
};

export type GetAnimalWeighingResponse = {
  code: number;
  message: string;
  data: {
    ingressEmergency: AnimalDetail[];
    ingressNormal: AnimalDetail[];
  };
};

export type AnimalWeighingData = {
  id: number;
  idSettingCertificateBrands: number;
  idProductiveStage: number;
  weight: number;
  slaughterDate: string;
  productType: ProductType;
  weighingStage: WeighingStage;
  marca: string;
  productiveStageName: string;
};
