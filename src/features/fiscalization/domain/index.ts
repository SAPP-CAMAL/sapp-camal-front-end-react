import { CommonHttpResponsePagination } from "@/features/people/domain";

export type FiltersFiscalization = {
  page?: number;
  limit?: number;
  monthlyDate?: string; // formato: "2025-12"
};

export type ResponseFiscalizationByFilter =
  CommonHttpResponsePagination<FiscalizationItem>;

export interface FiscalizationItem {
  createdAt: string;
  id: number;
  idBrands: number;
  idCertificate: number;
  codes: string;
  status: boolean;
  commentary: string;
  males: number;
  females: number;
  slaughterDate: string;
  idSpecies: number;
  idStatusCorrals: number;
  idCorralType: number;
  idFinishType: number | null;
  idCorralGroup: number;
  certificate: {
    id: number;
    issueDate: string;
    placeOrigin: string;
    origin: {
      id: number;
      description: string;
      status: boolean;
    };
  };
  brand: {
    id: number;
    name: string;
    introducer: {
      id: number;
      user: {
        id: number;
        person: {
          id: number;
          firstName: string;
          lastName: string;
          identification: string;
          fullName: string;
        };
      };
    };
  };
}
