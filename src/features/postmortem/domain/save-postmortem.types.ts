/**
 * Tipos para guardar datos de postmortem
 */

export interface ProductPostmortem {
    idBodyPart: number;
    weight: number;
    isTotalConfiscation: boolean;
    status: boolean;
}

export interface SubProductPostmortem {
    idSpeciesDisease: number;
    presence: number;
    percentageAffection: number;
    weight: number;
    status: boolean;
}

export interface SavePostmortemRequest {
    idDetailsSpeciesCertificate: number; // ID del animal
    status: boolean;
    productsPostmortem?: ProductPostmortem[];
    subProductsPostmortem?: SubProductPostmortem[];
}

export interface SavePostmortemResponse {
    code: number;
    message: string;
    data?: any;
}

/**
 * Tipos para obtener datos guardados de postmortem
 */

export interface BodyPartData {
  id: number;
  code: string;
  description: string;
}

export interface ProductPostmortemData {
  id: number;
  idPostmortem: number;
  idBodyPart: number;
  weight: string;
  isTotalConfiscation: boolean;
  status: boolean;
  bodyPart: BodyPartData;
}

export interface DiseaseData {
  id: number;
  names: string;
}

export interface ProductData {
  id: number;
  description: string;
}

export interface ProductDiseaseData {
  id: number;
  disease: DiseaseData;
  product: ProductData;
}

export interface SpeciesDiseaseData {
  id: number;
  productDisease: ProductDiseaseData;
}

export interface SubProductPostmortemData {
  id: number;
  idPostmortem: number;
  idSpeciesDisease: number;
  presence: number;
  weight: string;
  percentageAffection: string;
  status: boolean;
  speciesDisease: SpeciesDiseaseData;
}

export interface PostmortemData {
  id: number;
  idDetailsSpeciesCertificate: number;
  idVeterinarian: number;
  status: boolean;
  productPostmortem: ProductPostmortemData[];
  subProductPostmortem: SubProductPostmortemData[];
}

export interface GetPostmortemByBrandResponse {
  code: number;
  message: string;
  data: PostmortemData[];
}

/**
 * Tipos para obtener datos de postmortem por filtros
 */

export interface DetailCertificateBrands {
  id: number;
  idSettingCertificateBrands: number;
  idProductiveStage: number;
  quantity: number;
  status: boolean;
}

export interface DetailsSpeciesCertificate {
  id: number;
  detailCertificateBrands: DetailCertificateBrands;
}

export interface PostmortemFilterData {
  id: number;
  idDetailsSpeciesCertificate: number;
  idVeterinarian: number;
  status: boolean;
  detailsSpeciesCertificate: DetailsSpeciesCertificate;
  productPostmortem: ProductPostmortemData[];
  subProductPostmortem: SubProductPostmortemData[];
}

export interface GetPostmortemByFiltersRequest {
  slaughterDate: string;
  idSpecies: number;
  type?: string; // Tipo de corral: "NOR" o "EME"
}

export interface GetPostmortemByFiltersResponse {
  code: number;
  message: string;
  data: PostmortemFilterData[];
}
