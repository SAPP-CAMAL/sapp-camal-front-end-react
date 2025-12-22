export interface TransportConditionsFilters {
  startDate: string;
  endDate: string;
  specieId?: number | null;
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
