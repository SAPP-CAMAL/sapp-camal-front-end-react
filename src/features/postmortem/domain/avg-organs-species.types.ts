/**
 * Tipos para peso promedio de órganos por especie
 */

export interface AvgOrgansSpecies {
  id: number;
  idSpecie: number;
  idProduct: number;
  avgWeight: string;
  status: boolean;
}

export interface GetAvgOrgansSpeciesResponse {
  code: number;
  message: string;
  data: AvgOrgansSpecies | null;
}
