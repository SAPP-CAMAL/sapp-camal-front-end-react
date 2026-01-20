import { CommonHttpResponsePagination } from "@/features/people/domain";

export type FiltersSeizures = {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  idSpecie: number;
};

export type ResponseAnimalSeizures = CommonHttpResponsePagination<AnimalSeizureItem>;

export interface AnimalSeizureItem {
  createdAt: string;
  id: number;
  idDetailsCertificateBrands: number;
  idAnimalSex: number;
  code: string;
  status: boolean;
  detailCertificateBrands: {
    id: number;
    detailsCertificateBrand: {
      id: number;
      brand: {
        id: number;
        name: string;
        description: string | null;
        introducerId: number;
        status: boolean;
      };
    };
    productiveStage: {
      id: number;
      name: string;
      code: string;
      status: boolean;
      idSpecies: number;
      idAnimalSex: number;
    };
  };
  postmortem: PostmortemItem[];
}

export interface PostmortemItem {
  id: number;
  idDetailsSpeciesCertificate: number;
  idVeterinarian: number;
  status: boolean;
  subProductPostmortem: SubProductPostmortem[];
  productPostmortem: ProductPostmortem[];
}

export interface BodyPart {
  id: number;
  idPartType: number;
  code: string;
  description: string;
  status: boolean;
}

export interface ProductPostmortem {
  id: number;
  idPostmortem: number;
  idBodyPart: number;
  weight: string;
  isTotalConfiscation: boolean;
  status: boolean;
  bodyPart: BodyPart;
}

export interface SubProductPostmortem {
  id: number;
  idPostmortem: number;
  weight: string;
  status: boolean;
  percentageAffection: string;
  speciesDisease: {
    id: number;
    productDisease: {
      id: number;
      product: {
        id: number;
        description: string;
      };
      disease: {
        id: number;
        names: string;
      };
    };
  };
}
