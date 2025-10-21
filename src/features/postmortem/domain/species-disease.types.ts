/**
 * Tipos y interfaces para el manejo de enfermedades por especie
 */

export type Disease = {
  id: number;
  names: string;
  description: string | null;
};

export type Product = {
  id: number;
  description: string;
};

export type DiseaseGroup = {
  id: number;
  name: string;
  groupNumber: number;
} | null;

export type ProductDisease = {
  id: number;
  idProduct: number;
  idDisease: number;
  idDiseaseGroup: number | null;
  disease: Disease;
  product: Product;
  diseaseGroup: DiseaseGroup;
};

export type SpeciesDisease = {
  id: number;
  idProductDisease: number;
  idSpecie: number;
  productDisease: ProductDisease;
};

export type GetSpeciesDiseaseResponse = {
  code: number;
  message: string;
  data: SpeciesDisease[];
};

/**
 * Estructura agrupada para renderizar la tabla
 */
export type GroupedColumn = {
  product: string;
  diseases: {
    id: number;
    name: string;
    productDiseaseId: number;
  }[];
};
