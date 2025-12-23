import { CommonHttpResponsePagination } from "@/features/people/domain";

export type SeizureType = "products" | "subproducts";

export type FiltersSeizures = {
  page?: number;
  limit?: number;
  createdAt?: string;
  specieId: number;
};

export type ResponseProductSeizures = CommonHttpResponsePagination<ProductSeizureItem>;

export interface ProductSeizureItem {
  id: number;
  createdAt: string;
  idPostmortem: number;
  idBodyPart: number;
  weight: string;
  isTotalConfiscation: boolean;
  status: boolean;
  bodyPartId: number;
  bodyPartCode: string;
  bodyPartDescription: string;
  code: string;
  idCertificate: number;
  commentary: string;
  slaughterDate: string;
  specieName: string;
  specieDescription: string;
  specieCode: string;
  productiveStageId: number;
  productiveStageName: string;
  productiveStageCode: string;
  brandId: number;
  brandName: string;
  brandDescription: string | null;
  introducerId: number;
  userId: number;
  fullNameIntroducer: string;
}

export type ResponseSubproductSeizures = CommonHttpResponsePagination<SubproductSeizureItem>;

export interface SubproductSeizureItem {
  subProductPostmortem_id: number;
  idPostmortem: number;
  idSpeciesDisease: number;
  idProductAnatomicalLocation: number | null;
  presence: number;
  weight: string;
  percentageAffection: string;
  status: boolean;
  specieId: number;
  specieName: string;
  productId: number;
  productCode: string;
  productDescription: string;
  productiveStageId: number;
  productiveStageName: string;
  brandId: number;
  brandName: string;
  brandDescription: string | null;
  introducerId: number;
  userId: number;
  fullName: string;
  createdAt: string;
}
