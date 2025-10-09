/**
 * Ejemplo de uso del servicio de líneas y acceso a IDs
 * 
 * Este archivo muestra cómo usar el servicio para obtener líneas
 * y acceder a los IDs almacenados globalmente
 */

import { 
  getAllLinesService, 
  getActiveLinesService, 
  getActiveLinesDataService,
  getLineByDescriptionService 
} from '../server/db/antemortem.service';
import { LINE_IDS, getLineIdByType } from '../domain/line.types';

// Ejemplo de uso básico
export const exampleUsage = async () => {
  try {
    // 1. Obtener todas las líneas (actualiza automáticamente LINE_IDS)
    const allLinesResponse = await getAllLinesService();
    console.log('Todas las líneas:', allLinesResponse);

    // 2. Después de llamar getAllLinesService, los IDs están disponibles
    console.log('IDs de líneas disponibles:');
    console.log('Bovino ID:', LINE_IDS.BOVINO);
    console.log('Porcino ID:', LINE_IDS.PORCINO);
    console.log('Ovino-Caprino ID:', LINE_IDS.OVINO_CAPRINO);

    // 3. Obtener solo líneas activas (nombres mapeados)
    const activeLines = await getActiveLinesService();
    console.log('Líneas activas:', activeLines);

    // 4. Obtener datos completos de líneas activas
    const activeLinesData = await getActiveLinesDataService();
    console.log('Datos completos de líneas activas:', activeLinesData);

    // 5. Obtener ID por tipo específico
    const bovinoId = getLineIdByType("Bovinos");
    const porcinoId = getLineIdByType("Porcinos");
    const ovinoCaprinoId = getLineIdByType("Ovinos Caprinos");
    
    console.log('IDs específicos:');
    console.log(`Bovinos: ${bovinoId}`);
    console.log(`Porcinos: ${porcinoId}`);
    console.log(`Ovinos Caprinos: ${ovinoCaprinoId}`);

    // 6. Buscar línea específica por descripción
    const bovinoLine = await getLineByDescriptionService("Bovino");
    console.log('Línea de Bovinos encontrada:', bovinoLine);

    return {
      allLines: allLinesResponse,
      activeLines,
      activeLinesData,
      lineIds: LINE_IDS,
      specificLine: bovinoLine
    };
  } catch (error) {
    console.error('Error en ejemplo de uso:', error);
    throw error;
  }
};

// Función para obtener IDs después de inicializar
export const getAvailableLineIds = async () => {
  await getAllLinesService(); // Esto actualiza LINE_IDS
  return {
    bovino: LINE_IDS.BOVINO,
    porcino: LINE_IDS.PORCINO,
    ovinoCaprino: LINE_IDS.OVINO_CAPRINO
  };
};

// Hook personalizado para React (opcional)
export const useLineIds = () => {
  return {
    lineIds: LINE_IDS,
    getLineId: getLineIdByType,
    refreshLineIds: getAllLinesService
  };
};