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
  code: string; // Código del animal
  producto: string; // Sexo + Etapa productiva
  peso: number;
  fechaIngreso: string; // Fecha de ingreso
  idDetailsCertificateBrands: number;
  idAnimalSex: number;
};

export type SaveAnimalWeighingRequest = {
  idSettingCertificateBrands: number;
  idProductiveStage: number;
  weight: number;
  slaughterDate: string;
  productType: ProductType;
  weighingStage: WeighingStage;
};

export type GetAnimalWeighingRequest = {
  slaughterDate: string;
  idSpecies?: number;
  productType?: ProductType;
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
