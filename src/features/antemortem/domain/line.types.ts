export interface Specie {
  id: number;
  name: string;
  description: string;
  status: boolean;
}

export interface LineItem {
  id: number;
  name: string;
  description: string;
  status: boolean;
  idSpecie: number;
  specie: Specie;
}

export interface GetAllLinesResponse {
  code: number;
  message: string;
  data: LineItem[];
}

// Interfaces para la API de corrales v1/1.0.0/status-corrals/detail-corrals

export interface Brand {
  id: number;
  name: string;
}

export interface SettingCertificateBrand {
  id: number;
  idBrands: number;
  idCertificate: number;
  codes: string | null;
  status: boolean;
  commentary: string;
  males: number;
  females: number;
  slaughterDate: string;
  idSpecies: number;
  idStatusCorrals: number;
  idCorralType: number;
  idFinishType: number | null;
  brand: Brand;
}

export interface Corral {
  id: number;
  idCorralType: number;
  name: string;
  description: string;
  minimumQuantity: number;
  maximumQuantity: number;
  status: boolean;
}

export interface StatusCorralDetail {
  id: number;
  idCorrals: number;
  quantity: number;
  urlVideo: string[] | null;
  closeCorral: boolean;
  freeCorral: boolean;
  admissionDay: string;
  numberRings: number | null;
  status: boolean;
  corral: {
    id: number;
    name: string;
  };
  settingCertificatesBrands: SettingCertificateBrand[];
  haveObservations: boolean; // Nueva propiedad para mostrar/ocultar botón de observaciones
}

export interface GetCorralDetailsResponse {
  code: number;
  message: string;
  data: StatusCorralDetail[];
}

// Interfaces para la API de animales por marca
export interface AnimalDetail {
  id: number;
  idDetailsCertificateBrands: number;
  idAnimalSex: number; // 1 = hembra, otros = macho
  code: string;
  status: boolean;
  totalSigns?: number; // Total de signos guardados para este animal
}

export interface GetAnimalsByBrandResponse {
  code: number;
  message: string;
  data: AnimalDetail[];
}

// Tipos auxiliares para manejo de líneas
export type LineaType = "Bovinos" | "Porcinos" | "Ovinos Caprinos";

// Variables para almacenar IDs de líneas (se actualizarán desde el servicio)
export const LINE_IDS = {
  BOVINO: 0,
  PORCINO: 0,
  OVINO_CAPRINO: 0
};

// Función para actualizar los IDs de líneas
export const updateLineIds = (lines: LineItem[]) => {
  lines.forEach(line => {
    const description = line.description?.toLowerCase() || '';
    const specieName = line.specie?.name?.toLowerCase() || '';
    
    if (description.includes('bovino') || specieName.includes('bovino')) {
      LINE_IDS.BOVINO = line.id;
    } else if (description.includes('porcino') || specieName.includes('porcino')) {
      LINE_IDS.PORCINO = line.id;
    } else if (description.includes('ovino') || description.includes('caprino') || 
               specieName.includes('ovino') || specieName.includes('caprino')) {
      LINE_IDS.OVINO_CAPRINO = line.id;
    }
  });
};

// Función para mapear de LineItem a LineaType basado en description
export const mapLineItemToLineaType = (line: LineItem): LineaType => {
  const description = line.description?.toLowerCase() || '';
  const specieName = line.specie?.name?.toLowerCase() || '';
  
  if (description.includes('bovino') || specieName.includes('bovino')) {
    return "Bovinos";
  } else if (description.includes('porcino') || specieName.includes('porcino')) {
    return "Porcinos";
  } else if (description.includes('ovino') || description.includes('caprino') || 
             specieName.includes('ovino') || specieName.includes('caprino')) {
    return "Ovinos Caprinos";
  }
  
  return "Bovinos"; // fallback
};

// Función para obtener el ID de línea por tipo
export const getLineIdByType = (type: LineaType): number => {
  switch (type) {
    case "Bovinos": return LINE_IDS.BOVINO;
    case "Porcinos": return LINE_IDS.PORCINO;
    case "Ovinos Caprinos": return LINE_IDS.OVINO_CAPRINO;
    default: return LINE_IDS.BOVINO;
  }
};

// Función para mapear StatusCorralDetail a AntemortemRow
export const mapStatusCorralToAntemortemRow = (detail: StatusCorralDetail): import('./index').AntemortemRow => {
  const statusCorralId = detail.id;
  // Generar marcas basadas en las brands y sus machos/hembras
  const marcas = detail.settingCertificatesBrands.map(setting => {
    const brandName = setting.brand.name || '';
    const males = setting.males || 0;
    const females = setting.females || 0;
    // Corregir: M = Machos, H = Hembras
    return `${brandName} ${males}M ${females}H`;
  });

  // Generar marcasInfo con IDs
  const marcasInfo = detail.settingCertificatesBrands.map(setting => ({
    label: `${setting.brand.name || ''} ${setting.males || 0}M ${setting.females || 0}H`,
    settingCertificateBrandsId: setting.id
  }));

  // Si no hay marcas, usar nombre del corral
  if (marcas.length === 0) {
    marcas.push(`SIN MARCA 0M 0H`);
    marcasInfo.push({
      label: `SIN MARCA 0M 0H`,
      settingCertificateBrandsId: 0 // ID por defecto para marcas sin datos
    });
  }

  // Calcular totales
  const machos = detail.settingCertificatesBrands.reduce((sum, setting) => sum + (setting.males || 0), 0);
  const hembras = detail.settingCertificatesBrands.reduce((sum, setting) => sum + (setting.females || 0), 0);
  const total = detail.quantity || (machos + hembras);

  return {
    statusCorralId: statusCorralId,
    corral: detail.corral.name,
    marcas,
    marcasInfo,
    observaciones: "Sin observaciones", // Dejamos como estaba, es otro servicio
    argollas: detail.numberRings || 0, // Solo para bovinos
    total,
    machos,
    hembras,
    haveObservations: detail.haveObservations // Nueva propiedad de la API
  };
};

// Interfaces para signos clínicos /v1/1.0.0/clinical-signs-species/by-specie

export interface BodyPart {
  id: number;
  idPartType: number;
  code: string;
  description: string;
  status: boolean;
}

export interface SettingSignBody {
  id: number;
  idBodyParts: number;
  idClinicalSigns: number;
  status: boolean;
  bodyParts: BodyPart;
}

export interface ClinicalSign {
  id: number;
  description: string;
  groupSign: number;
  status: boolean;
  settingSignsBodies: SettingSignBody[];
}

export interface ClinicalSignWrapper {
  id: number;
  clinicalSign: ClinicalSign;
}

export interface GetClinicalSignsResponse {
  code: number;
  message: string;
  data: ClinicalSignWrapper[];
}

// Causas de muerte para animales muertos
export interface CauseOfDeath {
  id: number;
  name: string;
  status: boolean;
}

export interface GetCausesOfDeathResponse {
  code: number;
  message: string;
  data: CauseOfDeath[];
}

// Opiniones/Dictámenes para el resultado del antemortem
export interface Opinion {
  id: number;
  name: string;
  status: boolean;
}

export interface GetOpinionsResponse {
  code: number;
  message: string;
  data: Opinion[];
}

// Interfaces para guardar datos de antemortem POST /v1/1.0.0/antemortem

export interface SaveAntemortemBodyPart {
  idBodyParts: number;
  status: boolean;
}

export interface SaveAntemortemClinicalSign {
  idClinicalSignsSpecies: number;
  status: boolean;
  detailsBodyParts: SaveAntemortemBodyPart[];
}

export interface SaveAntemortemOpinion {
  idOpinion: number;
  status: boolean;
}

export interface SaveAntemortemDeadAnimal {
  idCausesDeath: number;
  confiscation: boolean; // true = Decomiso
  use: boolean; // true = Aprovechamiento
  status: boolean;
}

export interface SaveAntemortemRequest {
  idDetailsSpeciesCertificate: number; // ID del animal (AnimalDetail.id)
  status: boolean;
  settingAntemortemClinicalSignSpecie: SaveAntemortemClinicalSign[];
  antemortemOpinion: SaveAntemortemOpinion[];
  antemortemDeadAnimal?: SaveAntemortemDeadAnimal;
}

export interface SaveAntemortemResponse {
  code: number;
  message: string;
  data?: any;
}

// Interfaces para actualizar datos de antemortem PATCH /v1/1.0.0/antemortem/{id}

export interface UpdateAntemortemBodyPart {
  id?: number; // ID del registro existente de detailsBodyParts (opcional si es nuevo)
  idSettingAntemortemClinicalSignsSpecies?: number; // ID del registro padre (opcional si es nuevo)
  idBodyParts: number;
  status: boolean;
}

export interface UpdateAntemortemClinicalSign {
  id?: number; // ID del registro existente (opcional si es nuevo)
  idClinicalSignsSpecies: number;
  idAntemortem: number;
  status: boolean;
  detailsBodyParts: UpdateAntemortemBodyPart[];
}

export interface UpdateAntemortemOpinion {
  id?: number; // ID del registro existente (opcional si es nuevo)
  idAntemortem: number;
  idOpinion: number;
  status: boolean;
}

export interface UpdateAntemortemDeadAnimal {
  id?: number; // ID del registro existente (opcional si es nuevo)
  idAntemortem: number;
  idCausesDeath: number;
  confiscation: boolean;
  use: boolean;
  status: boolean;
}

export interface UpdateAntemortemRequest {
  idDetailsSpeciesCertificate: number;
  status: boolean;
  settingAntemortemClinicalSignSpecie: UpdateAntemortemClinicalSign[];
  antemortemOpinion: UpdateAntemortemOpinion[];
  antemortemDeadAnimal?: UpdateAntemortemDeadAnimal;
}

export interface UpdateAntemortemResponse {
  code: number;
  message: string;
  data?: any;
}

// Interfaces para obtener datos de antemortem existente GET /v1/1.0.0/antemortem/by-detail-specie-certificate

export interface AntemortemDeadAnimalData {
  id: number;
  idAntemortem: number;
  idCausesDeath: number;
  confiscation: boolean;
  use: boolean;
  status: boolean;
}

export interface AntemortemOpinionData {
  id: number;
  idAntemortem: number;
  idOpinion: number;
  status: boolean;
}

export interface AntemortemBodyPartDetail {
  id: number;
  idBodyParts: number; // ID real de la parte del cuerpo (REQUERIDO para pintar correctamente)
  status: boolean;
}

export interface SettingAntemortemClinicalSignSpecieData {
  id: number;
  idClinicalSignsSpecies: number;
  idAntemortem: number;
  status: boolean;
  detailsBodyParts: AntemortemBodyPartDetail[];
}

export interface AntemortemData {
  id: number;
  idDetailsSpeciesCertificate: number;
  idVeterinarian: number;
  evaluatedBy: number;
  status: boolean;
  deadAnimals: AntemortemDeadAnimalData[];
  antemortemOpinions: AntemortemOpinionData[];
  settingAntemortemClinicalSignsSpecies: SettingAntemortemClinicalSignSpecieData[];
}

export interface GetAntemortemByAnimalResponse {
  code: number;
  message: string;
  data: AntemortemData | null;
}

// Interfaces para las observaciones por status corral
export interface ObservationDetail {
  brandName: string;
  code: string;
  observationsText?: string;
  opinions?: string[];
  deathCause?: string;
  deathUse?: boolean;
  deathConfiscation?: boolean;
}

export interface GetObservationsByStatusCorralResponse {
  code: number;
  message: string;
  data: ObservationDetail[];
}

