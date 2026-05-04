/**
 * Tipos para guardar datos de postmortem
 */

export interface ProductPostmortem {
    idBodyPart: number;
    weight: number;
    isTotalConfiscation: boolean;
    status: boolean;
    bodyPartComment?: string;
    image?: string | null; // Imagen en base64 (opcional)
}

export interface SubProductPostmortem {
	idSpeciesDisease: number;
	presence: number;
	percentageAffection: number;
	weight: number;
	status: boolean;
	adverseSituation?: string;
	diseaseComment?: string;
	idProductAnatomicalLocation?: number; // ID de la ubicación anatómica (opcional)
	image?: string | null; // Imagen en base64 (opcional)
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
  sectionCode?: string; // Código de la sección del canal (ej: "A2", "B1")
  status: boolean;
  bodyPart: BodyPartData;
  bodyPartComment?: string;
  urlImage?: string | null;
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
  adverseSituation?: string;
  diseaseComment?: string;
  percentageAffection: string;
  status: boolean;
  idProductAnatomicalLocation?: number; // ID de la ubicación anatómica
  urlImage?: string | null; // URL de imagen guardada
  speciesDisease: SpeciesDiseaseData;
}

export interface PostmortemData {
  id: number;
  idDetailsSpeciesCertificate: number;
  idVeterinarian: number;
  status: boolean;
  urlImage?: string | null;
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
