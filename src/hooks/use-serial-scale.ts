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
  baudRate: 9600, // Velocidad estándar para Bernalo X1
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
      
      console.log('🔧 [BALANZA] Parseando datos:', {
        original: data,
        cleaned: cleaned,
        length: cleaned.length,
      });

      // Patrón específico de Bernalo X1
      // Formato: =X.YYYY o =-X.YYYY (con signo negativo)
      // Los dígitos están invertidos, hay que revertirlos
      const bernaloMatch = cleaned.match(/^(=)(-?)(\d+)\.?(\d*)$/);
      
      console.log('🔧 [BALANZA] Resultado del match regex:', {
        match: bernaloMatch,
        pattern: '/^(=)(-?)(\\d+)\\.?(\\d*)$/',
      });

      if (bernaloMatch) {
        const sign = bernaloMatch[2]; // "-" o ""
        const wholePart = bernaloMatch[3]; // "9"
        const decimalPart = bernaloMatch[4] || ""; // "7400"

        console.log('🔧 [BALANZA] Partes del match:', {
          sign: sign,
          wholePart: wholePart,
          decimalPart: decimalPart,
        });

        // Concatenar todos los dígitos
        const allDigits = wholePart + decimalPart; // "97400"

        // Invertir los dígitos
        const reversed = allDigits.split('').reverse().join(''); // "00479"

        // Convertir a número y dividir entre 10 para obtener el decimal
        const numValue = parseFloat(reversed) / 10; // 47.9

        // Aplicar el signo si es negativo
        const finalValue = sign === '-' ? -numValue : numValue;
        
        console.log('🔧 [BALANZA] Cálculo del peso:', {
          allDigits: allDigits,
          reversed: reversed,
          numValue: numValue,
          finalValue: finalValue,
        });

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
        console.log('⚠️ [BALANZA] Datos incompletos (empieza con = pero muy corto):', {
          cleaned: cleaned,
          length: cleaned.length,
        });
        return null;
      }

      console.log('❌ [BALANZA] No coincide con el patrón esperado:', {
        cleaned: cleaned,
        startsWithEquals: cleaned.startsWith('='),
      });
      return null;
    } catch (err) {
      console.error('❌ [BALANZA] Error al parsear peso:', {
        error: err,
        data: data,
      });
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
      const portConfig = {
        baudRate: finalConfig.baudRate!,
        dataBits: finalConfig.dataBits!,
        stopBits: finalConfig.stopBits!,
        parity: finalConfig.parity!,
        bufferSize: finalConfig.bufferSize!,
        flowControl: finalConfig.flowControl!,
      };
      
      console.log('🔌 [BALANZA] Configuración del puerto:', portConfig);
      
      // Intentar obtener información del puerto (si está disponible)
      try {
        const portInfo = (port as any).getInfo?.();
        if (portInfo) {
          console.log('📋 [BALANZA] Información del puerto:', portInfo);
        }
      } catch (e) {
        // No todos los navegadores soportan getInfo
      }
      
      console.log('⚠️ [BALANZA] PROBLEMA DETECTADO: Bytes no válidos (0x86, 0x87, 0x84)');
      console.log('');
      console.log('🔧 [BALANZA] GUÍA PARA SOLUCIONAR EL PROBLEMA DEL DRIVER:');
      console.log('');
      console.log('1️⃣ IDENTIFICAR EL TIPO DE ADAPTADOR USB-SERIAL:');
      console.log('   - Abre el Administrador de Dispositivos (Win + X → Administrador de dispositivos)');
      console.log('   - Busca "Puertos (COM y LPT)" o "Ports (COM & LPT)"');
      console.log('   - Expande y busca tu puerto (ej: COM3, COM4)');
      console.log('   - Haz clic derecho → Propiedades → Pestaña "Detalles"');
      console.log('   - En "Propiedad" selecciona "Id. de hardware" o "Hardware Ids"');
      console.log('   - Busca uno de estos identificadores:');
      console.log('');
      console.log('   📌 FTDI (más común):');
      console.log('      - Busca "VID_0403" o "FTDI"');
      console.log('      - Driver: FTDI VCP Driver');
      console.log('      - Descarga: https://ftdichip.com/drivers/vcp-drivers/');
      console.log('');
      console.log('   📌 CH340/CH341:');
      console.log('      - Busca "VID_1A86" o "CH340"');
      console.log('      - Driver: CH340 Driver');
      console.log('      - Descarga: https://github.com/WCHSoftGroup/ch34xser_linux');
      console.log('');
      console.log('   📌 Prolific PL2303 (TU CASO - VID_067B&PID_2303):');
      console.log('      - ⚠️ PROBLEMA DETECTADO: "THIS IS NOT PROLIFIC PL2303"');
      console.log('      - Esto significa que tienes un adaptador CLON o NO ORIGINAL');
      console.log('      - Los drivers oficiales de Prolific NO funcionan con clones');
      console.log('');
      console.log('   🔧 SOLUCIONES:');
      console.log('      1. Driver modificado (funciona con clones):');
      console.log('         - Busca: "Prolific PL2303 driver modified clone"');
      console.log('         - O: "PL2303_Prolific_DriverInstaller_v1.12.0" (versión antigua)');
      console.log('         - ⚠️ ADVERTENCIA: Drivers modificados no son oficiales');
      console.log('');
      console.log('      2. Comprar adaptador original (RECOMENDADO):');
      console.log('         - FTDI FT232RL (más compatible y estable)');
      console.log('         - Prolific PL2303 original');
      console.log('         - CH340 (más barato pero funciona bien)');
      console.log('');
      console.log('      3. Driver antiguo sin protección:');
      console.log('         - Versión 3.3.2.105 o anterior');
      console.log('         - Puede funcionar con clones pero es menos seguro');
      console.log('');
      console.log('   📌 Silicon Labs CP210x:');
      console.log('      - Busca "VID_10C4" o "CP210"');
      console.log('      - Driver: CP210x Driver');
      console.log('      - Descarga: https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers');
      console.log('');
      console.log('2️⃣ REINSTALAR EL DRIVER:');
      console.log('   - Desinstala el driver actual desde el Administrador de Dispositivos');
      console.log('   - Reinicia la computadora');
      console.log('   - Instala el driver correcto según el tipo de adaptador');
      console.log('   - Vuelve a conectar el cable USB');
      console.log('');
      console.log('3️⃣ CONFIGURACIÓN RECOMENDADA PARA BERNALO X1:');
      console.log('   - baudRate: 4800 (estándar para X1)');
      console.log('   - dataBits: 8');
      console.log('   - stopBits: 1');
      console.log('   - parity: "none"');
      console.log('   - flowControl: "none"');
      console.log('');
      console.log('4️⃣ VERIFICAR QUE EL PUERTO FUNCIONE:');
      console.log('   - El puerto debe aparecer SIN signos de exclamación amarillos');
      console.log('   - Si aparece con error, el driver está mal instalado');
      console.log('');
      
      await port.open(portConfig);

      portRef.current = port;
      setIsConnected(true);
      setError(null);
      console.log('✅ [BALANZA] Puerto conectado exitosamente');
      toast.success('Balanza conectada correctamente');

      // El usuario debe llamar startReading() manualmente después de conectar
    } catch (err: any) {
      const errorMsg = err.name === 'NotFoundError'
        ? 'No se seleccionó ningún puerto'
        : `Error al conectar: ${err.message}`;

      console.error('❌ [BALANZA] Error de conexión:', {
        name: err.name,
        message: err.message,
        stack: err.stack,
        error: err,
      });
      
      setError(errorMsg);
      toast.error(errorMsg);
    }
  }, [finalConfig]);

  // Desconectar de la balanza
  const disconnect = useCallback(async () => {
    try {
      // Detener lectura
      isReadingRef.current = false;

      // Limpiar timers y buffers
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      if (intervalTimerRef.current) {
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
          // Intentar solo liberar el lock si cancel falla
          try {
            readerRef.current.releaseLock();
          } catch (releaseErr) {
          }
        }
        readerRef.current = null;
      }

      // Cerrar puerto de forma segura
      if (portRef.current) {
        try {
          await portRef.current.close();
        } catch (err) {
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
    if (!portRef.current || isReadingRef.current) {
      console.log('⚠️ [BALANZA] No se puede iniciar lectura:', {
        hasPort: !!portRef.current,
        isReading: isReadingRef.current,
      });
      return;
    }

    try {
      console.log('🚀 [BALANZA] Iniciando lectura continua...');
      isReadingRef.current = true;
      setIsReading(true);

      // Decoder ASCII para convertir bytes a texto
      const decoder = new TextDecoder('ascii');
      let textBuffer = '';

      // Obtener reader del puerto
      const reader = portRef.current.readable!.getReader();
      readerRef.current = reader;
      
      console.log('📖 [BALANZA] Reader obtenido, comenzando a leer datos...');

      // Leer datos continuamente
      while (isReadingRef.current) {
        try {
          const { value, done } = await reader.read();

          if (done) {
            break;
          }

          // Convertir bytes a diferentes formatos para análisis
          const bytes = Array.from(value);
          
          console.log('📥 [BALANZA] Bytes recibidos:', {
            bytes: bytes,
            hex: bytes.map(b => `0x${b.toString(16).padStart(2, '0')}`).join(' '),
            decimal: bytes.map(b => b.toString().padStart(3, '0')).join(' '),
            length: bytes.length,
          });
          
          // Decodificar como texto ASCII
          const chunk = decoder.decode(value, { stream: true });
          textBuffer += chunk;
          
          console.log('📦 [BALANZA] Buffer de texto:', {
            chunk: chunk,
            textBuffer: textBuffer,
            bufferLength: textBuffer.length,
          });
          
          // Limitar tamaño del buffer
          if (textBuffer.length > 200) {
            textBuffer = textBuffer.slice(-100);
            console.log('⚠️ [BALANZA] Buffer recortado para evitar crecimiento infinito');
          }
          
          // Buscar patrón: =X.XXXXX (formato Bernalo X1)
          // Ejemplo: =0.50000 o =47.9000
          const regex = /=(\d+\.\d+)/g;
          let match;
          let lastIndex = 0;

          while ((match = regex.exec(textBuffer)) !== null) {
            const fullMatch = match[0]; // Por ejemplo: "=0.50000"
            const weightStr = match[1]; // Por ejemplo: "0.50000"
            lastIndex = regex.lastIndex;

            console.log('🔍 [BALANZA] Patrón encontrado:', {
              fullMatch: fullMatch,
              weightStr: weightStr,
              matchIndex: match.index,
              lastIndex: lastIndex,
            });

            // La balanza envía el valor dividido entre 10, hay que multiplicar
            const weightValue = parseFloat(weightStr) * 10;
            
            console.log('⚖️ [BALANZA] Peso parseado:', {
              raw: fullMatch,
              rawValue: parseFloat(weightStr),
              value: weightValue,
            });

            // Ignorar lecturas de cero o muy pequeñas (tara)
            if (weightValue > 1.0) {
              // Agregar peso al buffer (redondear a 1 decimal)
              const roundedWeight = Math.round(weightValue * 10) / 10;
              weightBufferRef.current.push(roundedWeight);
              
              console.log('📊 [BALANZA] Peso agregado al buffer:', {
                roundedWeight: roundedWeight,
                bufferSize: weightBufferRef.current.length,
                bufferContent: [...weightBufferRef.current],
              });

              // Iniciar intervalo de 3 segundos si no existe
              if (!intervalTimerRef.current) {
                intervalTimerRef.current = setTimeout(() => {
                  if (weightBufferRef.current.length === 0) {
                    intervalTimerRef.current = null;
                    return;
                  }

                  // Función para encontrar el valor que más se repite
                  const findMostFrequent = (arr: number[]): number => {
                    const frequency: { [key: number]: number } = {};
                    arr.forEach(num => {
                      frequency[num] = (frequency[num] || 0) + 1;
                    });

                    let maxFreq = 0;
                    let mostFrequentValue = arr[0];
                    for (const [value, freq] of Object.entries(frequency)) {
                      if (freq > maxFreq) {
                        maxFreq = freq;
                        mostFrequentValue = parseFloat(value);
                      }
                    }
                    return mostFrequentValue;
                  };

                  const mostFrequentWeight = findMostFrequent(weightBufferRef.current);

                  const finalWeight: WeightReading = {
                    value: mostFrequentWeight,
                    unit: 'kg',
                    raw: `=${mostFrequentWeight}`,
                    timestamp: new Date(),
                    stable: true,
                  };

                  setCurrentWeight(finalWeight);
                  console.log('✅ [BALANZA] Peso estable establecido:', finalWeight);

                  // Limpiar buffer y timer
                  weightBufferRef.current = [];
                  intervalTimerRef.current = null;
                }, 3000); // 3 segundos
              }
            } else {
              console.log('⚠️ [BALANZA] Peso ignorado (cero o tara):', weightValue);
            }
          }

          // Limpiar el buffer de los datos ya procesados
          if (lastIndex > 0) {
            textBuffer = textBuffer.substring(lastIndex);
            console.log('🧹 [BALANZA] Buffer limpiado, caracteres eliminados:', lastIndex);
          }
          
        } catch (readError: any) {
          console.error('❌ [BALANZA] Error al leer:', {
            name: readError.name,
            message: readError.message,
            stack: readError.stack,
            error: readError,
          });
          
          if (readError.name === 'NetworkError' || readError.name === 'NotReadableError') {
            console.error('🔴 [BALANZA] Error de red o puerto no legible, deteniendo lectura');
            break;
          }
          console.error('🔴 [BALANZA] Error inesperado al leer');
        }
      }
    } catch (err: any) {
      console.error('❌ [BALANZA] Error general de lectura:', {
        name: err.name,
        message: err.message,
        stack: err.stack,
        error: err,
      });
      setError(`Error de lectura: ${err.message}`);
      toast.error('Error al leer datos de la balanza');
    } finally {
      console.log('🛑 [BALANZA] Lectura detenida');
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
    setCurrentWeight(null);
    weightBufferRef.current = [];

    // Limpiar timer de intervalo si existe para que empiece desde cero
    if (intervalTimerRef.current) {
      clearTimeout(intervalTimerRef.current);
      intervalTimerRef.current = null;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

  }, []);

  // Iniciar lectura automática cuando se conecte
  useEffect(() => {
    if (isConnected && portRef.current && !isReadingRef.current) {
      startReading();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]); // Solo depender de isConnected, no de startReading

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      // Cleanup al desmontar el componente
      if (isReadingRef.current) {
        isReadingRef.current = false;

        // Limpiar timers
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }

        if (intervalTimerRef.current) {
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
                // Intentar solo liberar el lock si cancel falla
                try {
                  readerRef.current.releaseLock();
                } catch (releaseErr) {
                }
              }
              readerRef.current = null;
            }

            if (portRef.current) {
              try {
                await portRef.current.close();
              } catch (err) {
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
