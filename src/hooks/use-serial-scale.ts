/**
 * Hook para conectar y leer datos de balanza serial (Bernalo X1)
 * Usa Web Serial API para comunicación directa con el puerto serial
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';

// Tipos para Web Serial API
declare global {
  interface Navigator {
    serial: Serial;
  }

  interface Serial {
    requestPort(): Promise<SerialPort>;
    getPorts(): Promise<SerialPort[]>;
  }

  interface SerialPort {
    open(options: SerialOptions): Promise<void>;
    close(): Promise<void>;
    readable: ReadableStream<Uint8Array> | null;
    writable: WritableStream<Uint8Array> | null;
  }

  interface SerialOptions {
    baudRate: number;
    dataBits?: 7 | 8;
    stopBits?: 1 | 2;
    parity?: 'none' | 'even' | 'odd';
    bufferSize?: number;
    flowControl?: 'none' | 'hardware';
  }
}

interface SerialScaleConfig {
  baudRate?: number;
  dataBits?: 7 | 8;
  stopBits?: 1 | 2;
  parity?: 'none' | 'even' | 'odd';
  bufferSize?: number;
  flowControl?: 'none' | 'hardware';
}

interface WeightReading {
  value: number;
  unit: string;
  raw: string;
  timestamp: Date;
  stable: boolean;
}

const DEFAULT_CONFIG: SerialScaleConfig = {
  baudRate: 4800, // Prueba también: 4800, 19200, 115200
  dataBits: 8,
  stopBits: 1,
  parity: 'none',
  bufferSize: 255,
  flowControl: 'none',
};

export function useSerialScale(config: SerialScaleConfig = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [currentWeight, setCurrentWeight] = useState<WeightReading | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  const portRef = useRef<SerialPort | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const isReadingRef = useRef(false);
  const weightBufferRef = useRef<number[]>([]);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Memoizar config para evitar recreaciones
  const finalConfig = useRef({ ...DEFAULT_CONFIG, ...config }).current;

  // Verificar soporte solo en el cliente
  useEffect(() => {
    setIsSupported(typeof window !== 'undefined' && 'serial' in navigator);
  }, []);

  // Parsear datos de la balanza Bernalo X1
  const parseWeight = useCallback((data: string): WeightReading | null => {
    try {
      // Limpiar datos
      const cleaned = data.trim();

      // Patrón específico de Bernalo X1
      // Formato: =X.YYYY o =-X.YYYY (con signo negativo)
      // Los dígitos están invertidos, hay que revertirlos
      const bernaloMatch = cleaned.match(/^(=)(-?)(\d+)\.?(\d*)$/);

      if (bernaloMatch) {
        const sign = bernaloMatch[2]; // "-" o ""
        const wholePart = bernaloMatch[3]; // "9"
        const decimalPart = bernaloMatch[4] || ""; // "7400"

        // Concatenar todos los dígitos
        const allDigits = wholePart + decimalPart; // "97400"

        // Invertir los dígitos
        const reversed = allDigits.split('').reverse().join(''); // "00479"

        // Convertir a número y dividir entre 10 para obtener el decimal
        const numValue = parseFloat(reversed) / 10; // 47.9

        // Aplicar el signo si es negativo
        const finalValue = sign === '-' ? -numValue : numValue;

        return {
          value: finalValue,
          unit: 'raw', // Unidad cruda, se mostrará desde la API
          raw: cleaned,
          timestamp: new Date(),
          stable: true,
        };
      }

      // Si no coincide con el patrón completo, rechazar la lectura
      if (cleaned.startsWith('=') && cleaned.length < 5) {
        return null;
      }

      return null;
    } catch (err) {
      console.error('Error parsing weight:', err);
      return null;
    }
  }, []);

  // Conectar a la balanza
  const connect = useCallback(async () => {
    // Verificar soporte
    if (!('serial' in navigator)) {
      const errorMsg = 'Web Serial API no está disponible. Use Chrome o Edge.';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    try {
      // Solicitar puerto al usuario
      const port = await navigator.serial.requestPort();

      // Abrir puerto con configuración
      await port.open({
        baudRate: finalConfig.baudRate!,
        dataBits: finalConfig.dataBits!,
        stopBits: finalConfig.stopBits!,
        parity: finalConfig.parity!,
        bufferSize: finalConfig.bufferSize!,
        flowControl: finalConfig.flowControl!,
      });

      portRef.current = port;
      setIsConnected(true);
      setError(null);
      toast.success('Balanza conectada correctamente');

      // El usuario debe llamar startReading() manualmente después de conectar
    } catch (err: any) {
      const errorMsg = err.name === 'NotFoundError'
        ? 'No se seleccionó ningún puerto'
        : `Error al conectar: ${err.message}`;

      setError(errorMsg);
      toast.error(errorMsg);
      console.error('Connection error:', err);
    }
  }, [finalConfig]);

  // Desconectar de la balanza
  const disconnect = useCallback(async () => {
    try {
      // Detener lectura
      isReadingRef.current = false;

      // Limpiar timers y buffers
      if (debounceTimerRef.current) {
        console.log('🧹 Limpiando debounceTimer');
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      if (intervalTimerRef.current) {
        console.log('🧹 LIMPIANDO INTERVAL TIMER');
        clearTimeout(intervalTimerRef.current);
        intervalTimerRef.current = null;
      }

      weightBufferRef.current = [];

      // Cerrar reader de forma segura
      if (readerRef.current) {
        try {
          await readerRef.current.cancel();
          readerRef.current.releaseLock();
        } catch (err) {
          console.warn('Error al cancelar reader:', err);
          // Intentar solo liberar el lock si cancel falla
          try {
            readerRef.current.releaseLock();
          } catch (releaseErr) {
            console.warn('No se pudo liberar el lock del reader');
          }
        }
        readerRef.current = null;
      }

      // Cerrar puerto de forma segura
      if (portRef.current) {
        try {
          await portRef.current.close();
        } catch (err) {
          console.warn('Error al cerrar puerto:', err);
        }
        portRef.current = null;
      }

      setIsConnected(false);
      setIsReading(false);
      setCurrentWeight(null);
      toast.info('Balanza desconectada');
    } catch (err: any) {
      console.error('Disconnect error:', err);
      toast.error(`Error al desconectar: ${err.message}`);
    }
  }, []);

  // Iniciar lectura continua
  const startReading = useCallback(async () => {
    if (!portRef.current || isReadingRef.current) return;

    try {
      isReadingRef.current = true;
      setIsReading(true);

      const decoder = new TextDecoder();
      let buffer = '';

      // Obtener reader del puerto
      const reader = portRef.current.readable!.getReader();
      readerRef.current = reader;

      // Leer datos continuamente
      while (isReadingRef.current) {
        try {
          const { value, done } = await reader.read();

          if (done) {
            console.log('Serial port closed');
            break;
          }

          // Decodificar y agregar al buffer
          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          // Log para debugging
          console.log('Raw data received:', chunk, '| Buffer length:', buffer.length);

          // Procesar cada valor que empiece con =
          // La balanza envía datos en fragmentos: primero "=9" luego ".7400"
          // Formato completo: =9.7400 (representa 47.9 kg con dígitos invertidos)

          // Solo procesar cuando tengamos un patrón completo con = y punto decimal
          // Buscar patrones =X.YYYY donde X puede ser uno o más dígitos, YYYY son 4 dígitos
          const regex = /=(\d+)\.(\d{4})/g;
          let match;
          let lastIndex = 0;

          while ((match = regex.exec(buffer)) !== null) {
            const fullMatch = match[0]; // Por ejemplo: "=9.7400"
            lastIndex = regex.lastIndex;

            console.log('📥 Processing complete data:', fullMatch);
            const weight = parseWeight(fullMatch);
            if (weight) {
              console.log('⚖️ Weight parsed:', weight.value, weight.unit);

              // Ignorar lecturas de cero - no son válidas para el pesaje
              if (weight.value === 0) {
                console.log('⏭️ Peso cero ignorado - esperando peso real');
                continue; // Saltar al siguiente match
              }

              // Agregar peso al buffer (redondear a 2 decimales para agrupar valores similares)
              const roundedWeight = Math.round(weight.value * 100) / 100;
              weightBufferRef.current.push(roundedWeight);
              console.log('📊 Buffer actual:', weightBufferRef.current.length, 'lecturas -', weightBufferRef.current);

              // Iniciar intervalo de 5 segundos si no existe
              if (!intervalTimerRef.current) {
                console.log('⏱️ Iniciando intervalo de 5 segundos...');
                const currentUnit = weight.unit; // Guardar unit en el scope

                intervalTimerRef.current = setTimeout(() => {
                  console.log('⏰ ⏰ ⏰ Intervalo de 5 segundos completado ⏰ ⏰ ⏰');

                  if (weightBufferRef.current.length === 0) {
                    console.log('⚠️ Sin lecturas en el buffer');
                    intervalTimerRef.current = null;
                    return;
                  }

                  console.log('🔍 Procesando buffer con', weightBufferRef.current.length, 'lecturas:', weightBufferRef.current);

                  // Función para encontrar el valor que más se repite
                  const findMostFrequent = (arr: number[]): number => {
                    const frequency: { [key: number]: number } = {};

                    // Contar frecuencias
                    arr.forEach(num => {
                      frequency[num] = (frequency[num] || 0) + 1;
                    });

                    console.log('📊 Análisis de frecuencias:', frequency);

                    // Encontrar el más frecuente
                    let maxFreq = 0;
                    let mostFrequentValue = arr[0];

                    for (const [value, freq] of Object.entries(frequency)) {
                      if (freq > maxFreq) {
                        maxFreq = freq;
                        mostFrequentValue = parseFloat(value);
                      }
                    }

                    console.log('🎯 Valor más repetido:', mostFrequentValue, 'kg (apareció', maxFreq, 'veces)');

                    return mostFrequentValue;
                  };

                  const mostFrequentWeight = findMostFrequent(weightBufferRef.current);

                  console.log('═══════════════════════════════════════');
                  console.log('✅ PESO FINAL DESPUÉS DE 5 SEGUNDOS:', mostFrequentWeight.toFixed(2), 'kg');
                  console.log('═══════════════════════════════════════');

                  // Establecer el peso más frecuente
                  const finalWeight = {
                    value: mostFrequentWeight,
                    unit: currentUnit,
                    raw: `=${mostFrequentWeight * 1000}`,
                    timestamp: new Date(),
                    stable: true,
                  };

                  console.log('🚀 Estableciendo peso:', finalWeight);
                  setCurrentWeight(finalWeight);

                  console.log('✨ Estado actualizado con peso:', mostFrequentWeight.toFixed(2), currentUnit);

                  // Limpiar buffer y timer
                  weightBufferRef.current = [];
                  intervalTimerRef.current = null;
                  console.log('🧹 Buffer limpiado. Listo para nueva medición.');
                }, 5000); // 5 segundos

                console.log('✅ Timer creado con ID:', intervalTimerRef.current);
              } else {
                console.log('⏱️ Intervalo ya activo. Lecturas acumuladas:', weightBufferRef.current.length);
              }
            } else {
              console.warn('⚠️ Could not parse weight from:', fullMatch);
            }
          }

          // Limpiar el buffer de los datos ya procesados
          if (lastIndex > 0) {
            buffer = buffer.substring(lastIndex);
            console.log('🧹 Buffer limpiado. Nuevo buffer:', buffer);
          }

          // Si el buffer crece demasiado sin matches, limpiarlo
          if (buffer.length > 50) {
            console.warn('⚠️ Buffer demasiado grande sin match válido, limpiando:', buffer.substring(0, 50) + '...');
            buffer = '';
          }
        } catch (readError: any) {
          if (readError.name === 'NetworkError' || readError.name === 'NotReadableError') {
            console.error('Read error:', readError);
            break;
          }
          console.error('Unexpected read error:', readError);
        }
      }
    } catch (err: any) {
      console.error('Reading error:', err);
      setError(`Error de lectura: ${err.message}`);
      toast.error('Error al leer datos de la balanza');
    } finally {
      isReadingRef.current = false;
      setIsReading(false);
    }
  }, [parseWeight]);

  // Detener lectura
  const stopReading = useCallback(() => {
    isReadingRef.current = false;
    setIsReading(false);
  }, []);

  // Resetear el peso actual (útil cuando se selecciona un nuevo animal)
  const resetWeight = useCallback(() => {
    console.log('🔄 Reseteando peso capturado y timer de 5 segundos');
    setCurrentWeight(null);
    weightBufferRef.current = [];

    // Limpiar timer de intervalo si existe para que empiece desde cero
    if (intervalTimerRef.current) {
      console.log('🧹 Cancelando timer de 5 segundos activo');
      clearTimeout(intervalTimerRef.current);
      intervalTimerRef.current = null;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    console.log('✅ Balanza lista para nueva medición. Timer se reiniciará con la próxima lectura.');
  }, []);

  // Iniciar lectura automática cuando se conecte
  useEffect(() => {
    console.log('🔄 useEffect de auto-inicio ejecutándose. isConnected:', isConnected, 'isReadingRef:', isReadingRef.current);
    if (isConnected && portRef.current && !isReadingRef.current) {
      console.log('▶️ Iniciando lectura automática');
      startReading();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]); // Solo depender de isConnected, no de startReading

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      console.log('🔴 COMPONENTE DESMONTÁNDOSE - Limpiando recursos');
      // Cleanup al desmontar el componente
      if (isReadingRef.current) {
        isReadingRef.current = false;

        // Limpiar timers
        if (debounceTimerRef.current) {
          console.log('🧹 Limpiando debounceTimer en cleanup');
          clearTimeout(debounceTimerRef.current);
        }

        if (intervalTimerRef.current) {
          console.log('🧹 LIMPIANDO INTERVAL TIMER EN CLEANUP');
          clearTimeout(intervalTimerRef.current);
        }

        // Cerrar reader y puerto de forma segura
        const cleanup = async () => {
          try {
            if (readerRef.current) {
              try {
                // Primero intentar liberar el lock del reader
                await readerRef.current.cancel();
                readerRef.current.releaseLock();
              } catch (err) {
                console.warn('Error al cancelar reader (puede estar ya cerrado):', err);
                // Intentar solo liberar el lock si cancel falla
                try {
                  readerRef.current.releaseLock();
                } catch (releaseErr) {
                  console.warn('No se pudo liberar el lock del reader');
                }
              }
              readerRef.current = null;
            }

            if (portRef.current) {
              try {
                await portRef.current.close();
              } catch (err) {
                console.warn('Error al cerrar puerto (puede estar ya cerrado):', err);
              }
              portRef.current = null;
            }
          } catch (err) {
            console.error('Error en cleanup:', err);
          }
        };

        cleanup();
      }
    };
  }, []); // Sin dependencias para que solo se ejecute al montar/desmontar

  return {
    // Estado
    isConnected,
    isReading,
    currentWeight,
    error,
    isSupported,

    // Acciones
    connect,
    disconnect,
    startReading,
    stopReading,
    resetWeight,
  };
}
