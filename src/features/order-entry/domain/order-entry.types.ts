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
