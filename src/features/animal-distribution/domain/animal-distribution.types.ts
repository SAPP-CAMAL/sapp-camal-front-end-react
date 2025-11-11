/**
 * Tipos para la distribución de animales
 */

export interface AnimalDistribution {
  id: number;
  nroDistribucion: string;
  fechaDistribucion: string;
  nombreDestinatario: string;
  lugarDestino: string;
  placaMedioTransporte: string;
  idsIngresos: string;
  estado: "REGISTRADO" | "ENTREGADO";
}

export interface AnimalDistributionFilters {
  fechaFaenamiento: string;
  idEspecie: number;
}

export interface GetAnimalDistributionResponse {
  code: number;
  message: string;
  data: AnimalDistribution[];
}
