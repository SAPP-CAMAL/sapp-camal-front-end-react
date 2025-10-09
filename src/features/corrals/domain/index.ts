export type CorralStatus = "disponible" | "ocupado" | "animales";
export type LineaType = "bovinos" | "porcinos" | "ovinos-caprinos";
// ProcessType now uses group IDs instead of hardcoded names for better scalability
export type ProcessType = number | "todos"; // number = group ID, "todos" = show all

// Common HTTP Response Types
type CommonHttp = {
    code: number;
    message: string;
}

export type CommonHttpResponse<T> = CommonHttp & {
    data: T;
}

// Line Types
export type Specie = {
    id: number;
    name: string;
    description: string;
    status: boolean;
}

export type Line = {
    id: number;
    name: string;
    description: string;
    status: boolean;
    idSpecie: number;
    specie: Specie;
}

export type ResponseLine = CommonHttpResponse<Line>;

// Corral Group Types
export type CorralGroup = {
    id: number;
    name: string;
    description: string;
    idLine: number;
    status: boolean;
    line: {
        id: number;
        name: string;
        description: string;
        status: boolean;
        idSpecie: number;
    };
}

export type ResponseCorralGroup = CommonHttpResponse<CorralGroup>;
export type ResponseCorralGroups = CommonHttpResponse<CorralGroup[]>;

// API Corral Types (new structure from API)
export type ApiCorral = {
    id: number;
    idCorralType: number;
    name: string;
    description: string;
    minimumQuantity: number;
    maximumQuantity: number;
    status: boolean;
}

export type ResponseCorrales = CommonHttpResponse<ApiCorral[]>;

// Legacy Corral interface (for compatibility with existing components)
export interface Corral {
  id: string;
  name: string;
  limite: number;
  total: number;
  disponibles: number;
  status: CorralStatus;
  ocupacion: number; // Cantidad real de animales
  ocupacionPorcentaje?: number; // Porcentaje de ocupación para UI (barras, badges)
  idCorralType: number; // Tipo de corral necesario para validaciones
  processType?: ProcessType;
  dbStatus?: boolean; // Original database status for button logic
}

// Status corrals by admission date (shared type for services and UI)
export type StatusCorralByAdmission = {
  id: number;
  idCorrals: number;
  quantity: number;
  urlVideo: string[];
  closeCorral: boolean;
  freeCorral: boolean;
  admissionDay: string; // YYYY-MM-DD
  status: boolean;
};

// Brand detail types for corral management
export interface DetailCertificateBrand {
  idSettingCertificateBrands: number;
  idProductiveStage: number;
  quantity: number;
  status: boolean;
}

export type BrandDetail = {
  id: number;                    // ID of the setting-cert-brand record
  idStatusCorral: number;
  idBrand: number;
  males: number;
  females: number;
  codes: string | null;
  nameBrand: string;
  idCorral: number;
  idCorralType?: number; // Tipo de corral (1, 2, etc.)
  // Etapas productivas - machos
  terneros: number;
  toretes: number;
  toros: number;
  // Etapas productivas - hembras
  terneras: number;
  vaconas: number;
  vacas: number;
  // Detalles de etapas productivas
  detailsCertificateBrand?: DetailCertificateBrand[];
  // Optional pre-loaded certificate data for optimized transfers
  certificateData?: {
    idCertificate: number;
    idCorralType: number | null;
    idBrands: number;
  };
};

export type ResponseBrandDetails = CommonHttpResponse<BrandDetail[]>;

export interface CorralFilters {
  linea: LineaType;
  status: "todos" | CorralStatus;
  fecha: Date;
}

export function getOccupationColor(ocupacion: number) {
  if (ocupacion <= 70) return "bg-green-500";
  if (ocupacion <= 90) return "bg-yellow-500";
  return "bg-red-500";
}

// Helper function to get default group ID for each line (for direct loading)
export function getLineaIdFromType(lineaType: LineaType): number {
  switch (lineaType) {
    case "bovinos":
      return 1;
    case "porcinos":
      return 2;
    case "ovinos-caprinos":
      return 3;
    default:
      return 1;
  }
}

// Helper function to get the "Especiales" group ID for each line
export function getEspecialesGroupIdByLine(lineaType: LineaType): number {
  switch (lineaType) {
    case "bovinos":
      return 6; // Línea 1: ID 6
    case "porcinos":
      return 7; // Línea 2: ID 7
    case "ovinos-caprinos":
      return 8; // Línea 3: ID 8
    default:
      return 6;
  }
}

// Helper function to get known group IDs and their count field mapping
export function getKnownGroupIdsWithCountMapping(): Record<number, keyof { depilados: number; chamuscados: number; mercado: number; guayaquil: number }> {
  return {
    1: 'mercado',     // Mercado Local Bovinos
    2: 'guayaquil',   // Guayaquil Bovinos
    3: 'depilados',   // Depilado Porcinos
    4: 'chamuscados', // Chamuscado Porcinos
    5: 'mercado',     // Corrales Generales Ovinos-Caprinos (uses mercado count for now)
    // Especiales groups will be handled separately
  };
}

export function getLineaTypeFromId(id: number): LineaType {
  switch (id) {
    case 1:
      return "bovinos";
    case 2:
      return "porcinos";
    case 3:
      return "ovinos-caprinos";
    default:
      return "bovinos";
  }
}
