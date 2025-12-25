export interface TransportConditionsFilters {
  page: number;
  limit: number;
  startDate: string;
  endDate: string;
  idSpecie?: number | null;
  code?: string;
  identification?: string;
  plate?: string;
  fullName?: string;
}

export interface TransportConditionItem {
  id: number;
  entryDate: string;
  carrierName: string;
  bedType: string;
  arrivalConditions: string;
  ownMobilization: boolean;
  observations: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
