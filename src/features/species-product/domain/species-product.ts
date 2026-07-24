export interface SpeciesProduct {
  id: number;
  idSpecies: number;
  idProductType: number;
  productType?: {
    id: number;
    typeName: string;
    code: string;
  };
  productName: string;
  productCode: string;
  idAnimalSex?: number | null;
  displayOrder: number;
  status: boolean;
}
