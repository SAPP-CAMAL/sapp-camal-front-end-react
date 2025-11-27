export interface OrderEntry {
  id: number;
  nroIngreso: string;
  codigo: string;
  fechaIngreso: string;
  codDestinatario: string;
  especie: string;
  totalAnimales: number;
  fechaFaenamiento?: string;
}

export interface AnimalStockItem {
  id: number;
  code: string;
  brandName: string;
  introducer: string;
  netWeight: number;
  createAt: string;
}

export interface AnimalStock {
  animal: AnimalStockItem[];
  product: number;
  subProduct: number;
}

export interface SpeciesProduct {
  id: number;
  idSpecies: number;
  idProductType: number;
  productName: string;
  productCode: string;
  idAnimalSex: number | null;
  displayOrder: number;
}

export interface ProductStockItem {
  id: number;
  idDetailsSpeciesCertificate: number;
  idSpeciesProduct: number;
  available: boolean;
  confiscation: boolean;
  speciesProduct: SpeciesProduct;
}

export interface StockByIdsRequest {
  productTypeCode: "PRO" | "SUB";
  idDetailsSpeciesCertificate: number[];
}

export interface ProductSubproduct {
  id: number;
  especie: string;
  codigoAnimal: string;
  subproducto: string;
  nroIngreso: string;
}

export interface OrderEntryFilters {
  searchTerm: string;
}
