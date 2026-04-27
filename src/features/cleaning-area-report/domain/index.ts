export type CleaningTypeEntry = {
  LD: boolean;
  LP: boolean;
  VQ: boolean;
  PQ: boolean;
  NA: boolean;
  URL: boolean;
};

export type CleaningAreaDateRecord = {
  date: string; // yyyy-MM-dd
  cleaningType: CleaningTypeEntry;
  glassPlastic: CleaningTypeEntry;
  cleanedBy?: string;
  recordId?: number; // ID del registro principal para actualización
  detailId?: number; // ID del detalle para actualización
};

export type CleaningAreaItem = {
  id: number;
  name: string;
  records: CleaningAreaDateRecord[];
};

export type CleaningAreaSection = {
  id: number;
  area: string;
  items: CleaningAreaItem[];
};

export type CleaningAreaReportResponse = {
  code: number;
  message: string;
  data: CleaningAreaSection[];
};

// API Response types
export type ApiStructure = {
  id: number;
  idCatalog: number;
  catalogName: string;
  catalogType: string;
  orderIndex: number;
  status: boolean;
};

export type ApiAreaStructure = {
  idArea: number;
  idAreaCatalog: number;
  areaCatalogName: string;
  areaCatalogDescription: string;
  areaOrderIndex: number;
  structures: ApiStructure[];
};

export type ApiStructureResponse = {
  code: number;
  message: string;
  data: ApiAreaStructure[];
};
