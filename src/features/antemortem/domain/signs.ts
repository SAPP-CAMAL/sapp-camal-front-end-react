import { 
  ClinicalSign, 
  ClinicalSignWrapper, 
  SaveAntemortemRequest,
  SaveAntemortemClinicalSign,
  SaveAntemortemOpinion,
  SaveAntemortemDeadAnimal,
  AntemortemData,
  UpdateAntemortemRequest,
  UpdateAntemortemClinicalSign,
  UpdateAntemortemOpinion,
  UpdateAntemortemDeadAnimal,
  UpdateAntemortemBodyPart
} from "./line.types";

// Tipos dinámicos basados en la API
export type SignWithBodyParts = {
  id: number;
  description: string;
  bodyParts: Array<{
    id: number;
    code: string;
    description: string;
  }>;
};

export type SimpleSign = {
  id: number;
  description: string;
};

// Nota: DICTAMEN_OPTIONS ahora viene de la API, pero mantenemos esto para compatibilidad
export const DICTAMEN_OPTIONS = [
  "MATANZA NORMAL",
  "MATANZA BAJO PRECAUCIONES ESPECIALES", 
  "MATANZA DE EMERGENCIA",
  "APLAZAMIENTO DE MATANZA"
] as const;

export type DictamenOption = typeof DICTAMEN_OPTIONS[number];

// Tipo de disposición para animales muertos
export const DISPOSAL_TYPES = ["Decomiso", "Aprovechamiento"] as const;
export type DisposalType = typeof DISPOSAL_TYPES[number];

export interface AnimalSignsSelection {
  // Grupos con partes del cuerpo: Map de signId -> Set de bodyPartIds
  signsWithBodyParts: Map<number, Set<number>>;
  // Signos simples: Map de signId -> boolean
  simpleSigns: Map<number, boolean>;
  // Dictamen: conjunto de IDs de opiniones seleccionadas
  dictamen: Set<number>;
  // Animales muertos
  isDeadAnimal: boolean;
  selectedCauseOfDeath?: number; // ID de la causa de muerte seleccionada
  disposalType?: DisposalType; // Decomiso o Aprovechamiento
}

export function createEmptySelection(): AnimalSignsSelection {
  return {
    signsWithBodyParts: new Map(),
    simpleSigns: new Map(),
    dictamen: new Set([1]), // Matanza Normal (ID 1) marcado por defecto
    isDeadAnimal: false,
    selectedCauseOfDeath: undefined,
    disposalType: undefined,
  };
}

export function countSelection(sel: AnimalSignsSelection): number {
  // Contar signos con partes del cuerpo (cada signo cuenta como 1 si tiene al menos una parte seleccionada)
  const bodyPartsCount = Array.from(sel.signsWithBodyParts.values())
    .reduce((acc, parts) => acc + (parts.size > 0 ? 1 : 0), 0);
  
  // Contar signos simples
  const simpleCount = Array.from(sel.simpleSigns.values())
    .reduce((acc, selected) => acc + (selected ? 1 : 0), 0);
  
  // Contar dictamen
  const dictamenCount = sel.dictamen.size;
  
  // Contar datos de animales muertos
  let deadAnimalCount = 0;
  if (sel.isDeadAnimal) {
    deadAnimalCount++; // Por marcar como muerto
    if (sel.selectedCauseOfDeath) deadAnimalCount++; // Por seleccionar causa
    if (sel.disposalType) deadAnimalCount++; // Por seleccionar disposición
  }
  
  return bodyPartsCount + simpleCount + dictamenCount + deadAnimalCount;
}

export function cloneSelection(sel: AnimalSignsSelection): AnimalSignsSelection {
  // Clonar signsWithBodyParts (Map de Maps de Sets)
  const clonedBodyParts = new Map<number, Set<number>>();
  sel.signsWithBodyParts.forEach((bodyParts, signId) => {
    clonedBodyParts.set(signId, new Set(bodyParts));
  });

  return {
    signsWithBodyParts: clonedBodyParts,
    simpleSigns: new Map(sel.simpleSigns),
    dictamen: new Set(sel.dictamen),
    isDeadAnimal: sel.isDeadAnimal,
    selectedCauseOfDeath: sel.selectedCauseOfDeath,
    disposalType: sel.disposalType,
  };
}

// Helper para procesar los signos clínicos de la API
export function processClinicalSigns(clinicalSignWrappers: ClinicalSignWrapper[]): {
  signsWithBodyParts: SignWithBodyParts[];
  simpleSigns: SimpleSign[];
} {
  const signsWithBodyParts: SignWithBodyParts[] = [];
  const simpleSigns: SimpleSign[] = [];

  clinicalSignWrappers.forEach(wrapper => {
    const sign = wrapper.clinicalSign;
    
    if (sign.settingSignsBodies && sign.settingSignsBodies.length > 0) {
      signsWithBodyParts.push({
        id: wrapper.id, 
        description: sign.description,
        bodyParts: sign.settingSignsBodies.map(ssb => ({
          id: ssb.bodyParts.id,
          code: ssb.bodyParts.code,
          description: ssb.bodyParts.description
        }))
      });
    } else {
      simpleSigns.push({
        id: wrapper.id, 
        description: sign.description
      });
    }
  });

  return { signsWithBodyParts, simpleSigns };
}

// Helper para convertir AnimalSignsSelection a formato de API para guardar
export function convertSelectionToSaveRequest(
  animalId: number,
  selection: AnimalSignsSelection
): SaveAntemortemRequest {
  // Convertir signos clínicos con partes del cuerpo
  const clinicalSigns: SaveAntemortemClinicalSign[] = [];
  
  // Signos con partes del cuerpo
  selection.signsWithBodyParts.forEach((bodyPartIds, signId) => {
    if (bodyPartIds.size > 0) {
      clinicalSigns.push({
        idClinicalSignsSpecies: signId,
        status: true,
        detailsBodyParts: Array.from(bodyPartIds).map(bodyPartId => ({
          idBodyParts: bodyPartId,
          status: true
        }))
      });
    }
  });
  
  // Signos simples (sin partes del cuerpo)
  selection.simpleSigns.forEach((isSelected, signId) => {
    if (isSelected) {
      clinicalSigns.push({
        idClinicalSignsSpecies: signId,
        status: true,
        detailsBodyParts: []
      });
    }
  });
  
  // Convertir opiniones/dictámenes
  const opinions: SaveAntemortemOpinion[] = Array.from(selection.dictamen).map(opinionId => ({
    idOpinion: opinionId,
    status: true
  }));
  
  // Construir datos de animal muerto si aplica
  let deadAnimal: SaveAntemortemDeadAnimal | undefined;
  if (selection.isDeadAnimal && selection.selectedCauseOfDeath) {
    deadAnimal = {
      idCausesDeath: selection.selectedCauseOfDeath,
      confiscation: selection.disposalType === "Decomiso",
      use: selection.disposalType === "Aprovechamiento",
      status: true
    };
  }
  
  return {
    idDetailsSpeciesCertificate: animalId,
    status: true,
    settingAntemortemClinicalSignSpecie: clinicalSigns,
    antemortemOpinion: opinions,
    antemortemDeadAnimal: deadAnimal
  };
}

// Helper para convertir datos de API (GET) a AnimalSignsSelection
export function convertAntemortemDataToSelection(
  antemortemData: AntemortemData | null
): AnimalSignsSelection {
  // Si no hay datos, retornar selección vacía
  if (!antemortemData) {
    return createEmptySelection();
  }

  const selection = createEmptySelection();

  // Procesar signos clínicos
  antemortemData.settingAntemortemClinicalSignsSpecies.forEach(sign => {
    if (!sign.status) return; // Solo procesar signos activos

    if (sign.detailsBodyParts && sign.detailsBodyParts.length > 0) {
      // Signo con partes del cuerpo
      const bodyPartIds = sign.detailsBodyParts
        .filter(bp => bp.status)
        .map(bp => bp.idBodyParts || bp.id);
      
      if (bodyPartIds.length > 0) {
        selection.signsWithBodyParts.set(
          sign.idClinicalSignsSpecies,
          new Set(bodyPartIds)
        );
      }
    } else {
      // Signo simple (sin partes del cuerpo)
      selection.simpleSigns.set(sign.idClinicalSignsSpecies, true);
    }
  });

  // Procesar opiniones/dictámenes
  selection.dictamen.clear(); // Limpiar el default (Matanza Normal)
  antemortemData.antemortemOpinions.forEach(opinion => {
    if (opinion.status) {
      selection.dictamen.add(opinion.idOpinion);
    }
  });

  // Procesar datos de animales muertos
  if (antemortemData.deadAnimals && antemortemData.deadAnimals.length > 0) {
    const deadAnimal = antemortemData.deadAnimals.find(da => da.status);
    if (deadAnimal) {
      selection.isDeadAnimal = true;
      selection.selectedCauseOfDeath = deadAnimal.idCausesDeath;
      selection.disposalType = deadAnimal.confiscation ? "Decomiso" : "Aprovechamiento";
    }
  }

  return selection;
}

// Helper para convertir AnimalSignsSelection a formato de API para actualizar
export function convertSelectionToUpdateRequest(
  animalId: number,
  antemortemId: number,
  selection: AnimalSignsSelection,
  existingData: AntemortemData | null
): UpdateAntemortemRequest {
  const clinicalSigns: UpdateAntemortemClinicalSign[] = [];
  
  // Crear un mapa de los signos existentes para preservar IDs
  const existingSignsMap = new Map<number, AntemortemData['settingAntemortemClinicalSignsSpecies'][0]>();
  existingData?.settingAntemortemClinicalSignsSpecies.forEach(sign => {
    existingSignsMap.set(sign.idClinicalSignsSpecies, sign);
  });
  
  // Crear un Set de signos procesados para evitar duplicados
  const processedSigns = new Set<number>();
  
  // 1. PROCESAR SIGNOS CON PARTES DEL CUERPO - SELECCIONADOS ACTUALMENTE
  selection.signsWithBodyParts.forEach((bodyPartIds, signId) => {
    if (bodyPartIds.size > 0) {
      const existingSign = existingSignsMap.get(signId);
      
      // Si es nuevo, enviar todos los body parts con status: true
      if (!existingSign) {
        const allBodyParts: UpdateAntemortemBodyPart[] = Array.from(bodyPartIds).map(bodyPartId => ({
          id: undefined, // Nuevo body part, sin ID
          idSettingAntemortemClinicalSignsSpecies: undefined,
          idBodyParts: bodyPartId,
          status: true
        }));
        
        clinicalSigns.push({
          id: undefined,
          idClinicalSignsSpecies: signId,
          idAntemortem: antemortemId,
          status: true,
          detailsBodyParts: allBodyParts
        });
        
        processedSigns.add(signId);
        return;
      }
      
      // Si existe, crear un mapa completo de TODOS los body parts (activos e inactivos)
      const existingBodyPartsMap = new Map<number, AntemortemData['settingAntemortemClinicalSignsSpecies'][0]['detailsBodyParts'][0]>();
      existingSign.detailsBodyParts.forEach(bp => {
        if (bp.idBodyParts) {
          existingBodyPartsMap.set(bp.idBodyParts, bp);
        }
      });
      
      const changedBodyParts: UpdateAntemortemBodyPart[] = [];
      
      // 1A. Body parts ACTIVADOS (están seleccionados)
      Array.from(bodyPartIds).forEach(bodyPartId => {
        const existingBodyPart = existingBodyPartsMap.get(bodyPartId);
        
        // Solo enviar si es NUEVO o si estaba INACTIVO (status: false) y ahora está activo
        if (!existingBodyPart || existingBodyPart.status === false) {
          changedBodyParts.push({
            id: existingBodyPart?.id, // Usar ID si existe, undefined si es nuevo
            idSettingAntemortemClinicalSignsSpecies: existingSign.id,
            idBodyParts: bodyPartId,
            status: true
          });
        }
      });
      
      // 1B. Body parts DESACTIVADOS (existían activos pero ya NO están seleccionados)
      existingSign.detailsBodyParts.forEach(bp => {
        if (bp.idBodyParts && !bodyPartIds.has(bp.idBodyParts) && bp.status === true) {
          // Estaba ACTIVO y ahora NO está seleccionado - DESACTIVAR
          changedBodyParts.push({
            id: bp.id,
            idSettingAntemortemClinicalSignsSpecies: existingSign.id,
            idBodyParts: bp.idBodyParts,
            status: false
          });
        }
      });
      
      // Solo enviar si hay cambios
      if (changedBodyParts.length > 0) {
        clinicalSigns.push({
          id: existingSign.id,
          idClinicalSignsSpecies: signId,
          idAntemortem: antemortemId,
          status: true,
          detailsBodyParts: changedBodyParts
        });
      }
      
      processedSigns.add(signId);
    }
  });
  
  // 2. PROCESAR SIGNOS SIMPLES - SELECCIONADOS ACTUALMENTE
  selection.simpleSigns.forEach((isSelected, signId) => {
    if (isSelected) {
      const existingSign = existingSignsMap.get(signId);
      
      // Solo incluir si es nuevo (no tiene registro existente)
      if (!existingSign) {
        clinicalSigns.push({
          id: undefined, // Nuevo registro, sin ID
          idClinicalSignsSpecies: signId,
          idAntemortem: antemortemId,
          status: true,
          detailsBodyParts: []
        });
      }
      
      processedSigns.add(signId);
    }
  });
  
  // 3. PROCESAR SIGNOS QUE EXISTÍAN PERO YA NO ESTÁN SELECCIONADOS (status: false)
  existingData?.settingAntemortemClinicalSignsSpecies.forEach(existingSign => {
    // Si ya procesamos este signo, saltar
    if (processedSigns.has(existingSign.idClinicalSignsSpecies)) {
      return;
    }
    
    // Este signo existía pero ya no está seleccionado - ENVIAR CON STATUS FALSE
    const hasBodyParts = existingSign.detailsBodyParts && existingSign.detailsBodyParts.length > 0;
    
    clinicalSigns.push({
      id: existingSign.id,
      idClinicalSignsSpecies: existingSign.idClinicalSignsSpecies,
      idAntemortem: antemortemId,
      status: false, // DESMARCADO
      detailsBodyParts: hasBodyParts 
        ? existingSign.detailsBodyParts.map(bp => ({
            id: bp.id, // Preservar ID del body part existente
            idSettingAntemortemClinicalSignsSpecies: existingSign.id,
            idBodyParts: bp.idBodyParts || bp.id,
            status: false
          }))
        : []
    });
    
    processedSigns.add(existingSign.idClinicalSignsSpecies);
  });
  
  // PROCESAR OPINIONES/DICTÁMENES
  const existingOpinionsMap = new Map<number, AntemortemData['antemortemOpinions'][0]>();
  existingData?.antemortemOpinions.forEach(opinion => {
    existingOpinionsMap.set(opinion.idOpinion, opinion);
  });
  
  const opinions: UpdateAntemortemOpinion[] = [];
  const processedOpinions = new Set<number>();
  
  // Opiniones seleccionadas (status: true) - SOLO ENVIAR SI ES NUEVA
  Array.from(selection.dictamen).forEach(opinionId => {
    const existingOpinion = existingOpinionsMap.get(opinionId);
    
    // Solo incluir si es nueva (no existía antes)
    if (!existingOpinion) {
      opinions.push({
        id: undefined, // Nueva opinión, sin ID
        idAntemortem: antemortemId,
        idOpinion: opinionId,
        status: true
      });
    }
    
    processedOpinions.add(opinionId);
  });
  
  // Opiniones que existían pero ya no están seleccionadas (status: false)
  existingData?.antemortemOpinions.forEach(existingOpinion => {
    if (!processedOpinions.has(existingOpinion.idOpinion)) {
      opinions.push({
        id: existingOpinion.id,
        idAntemortem: antemortemId,
        idOpinion: existingOpinion.idOpinion,
        status: false
      });
      processedOpinions.add(existingOpinion.idOpinion);
    }
  });
  
  // PROCESAR ANIMALES MUERTOS
  let deadAnimal: UpdateAntemortemDeadAnimal | undefined;
  const existingDeadAnimal = existingData?.deadAnimals?.find(da => da.status);
  
  if (selection.isDeadAnimal && selection.selectedCauseOfDeath) {
    // Animal está marcado como muerto
    const isNew = !existingDeadAnimal;
    const hasChanged = existingDeadAnimal && (
      existingDeadAnimal.idCausesDeath !== selection.selectedCauseOfDeath ||
      existingDeadAnimal.confiscation !== (selection.disposalType === "Decomiso") ||
      existingDeadAnimal.use !== (selection.disposalType === "Aprovechamiento")
    );
    
    // Solo enviar si es nuevo o cambió
    if (isNew || hasChanged) {
      deadAnimal = {
        id: existingDeadAnimal?.id,
        idAntemortem: antemortemId,
        idCausesDeath: selection.selectedCauseOfDeath,
        confiscation: selection.disposalType === "Decomiso",
        use: selection.disposalType === "Aprovechamiento",
        status: true
      };
    }
  } else if (existingDeadAnimal) {
    // Existía como muerto pero ahora está desmarcado - ENVIAR CON STATUS FALSE
    deadAnimal = {
      id: existingDeadAnimal.id,
      idAntemortem: antemortemId,
      idCausesDeath: existingDeadAnimal.idCausesDeath,
      confiscation: existingDeadAnimal.confiscation,
      use: existingDeadAnimal.use,
      status: false
    };
  }
  
  // Construir el request final
  const updateRequest: UpdateAntemortemRequest = {
    idDetailsSpeciesCertificate: animalId,
    status: true,
    settingAntemortemClinicalSignSpecie: clinicalSigns,
    antemortemOpinion: opinions
  };
  
  // Solo incluir deadAnimal si existe (no enviar undefined)
  if (deadAnimal !== undefined) {
    updateRequest.antemortemDeadAnimal = deadAnimal;
  }
  
  return updateRequest;
}

