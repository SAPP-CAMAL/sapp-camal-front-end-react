/**
 * Tipos para el pesaje de animales en diferentes etapas
 */

export type ProductType = "CANAL" | "MEDIA_CANAL";

export type WeighingStage = "EN_PIE" | "DESPUES_FAENAMIENTO" | "DISTRIBUCION";

export type AnimalWeighingFilters = {
  slaughterDate: string;
  idSpecies: number;
  productType: ProductType;
  weighingStage: WeighingStage;
  selectedHooks: number[];
};

export type AnimalWeighingRow = {
  id: string;
  marca: string;
  producto: string;
  peso: number;
  idSettingCertificateBrands: number;
  idProductiveStage: number;
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
  idSpecies: number;
  productType?: ProductType;
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
