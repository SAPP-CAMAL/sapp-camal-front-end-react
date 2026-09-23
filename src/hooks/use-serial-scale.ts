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
  baudRate: 9600, // Bernalo X1
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
  const lastPublishedRef = useRef<number | null>(null);

  // Memoizar config para evitar recreaciones
  const finalConfig = useRef({ ...DEFAULT_CONFIG, ...config }).current;

  // Verificar soporte solo en el cliente
  useEffect(() => {
    setIsSupported(typeof window !== 'undefined' && 'serial' in navigator);
  }, []);

  // Parsear datos de la balanza Bernalo X1 (Preserva la lógica original para producción)
  const parseBernaloFormat = useCallback((data: string): WeightReading | null => {
    // Patrón específico de Bernalo X1: =X.YYYY o =-X.YYYY
    const bernaloMatch = data.match(/^(=)(-?)(\d+)\.?(\d*)$/);

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
        unit: 'raw',
        raw: data,
        timestamp: new Date(),
        stable: true,
      };
    }
    return null;
  }, []);

  // Parsear datos de formato estándar (10-11 bytes o similar)
  const parseStandardFormat = useCallback((data: string): WeightReading | null => {
    // Intenta extraer el número directamente
    // Soporta varios formatos:
    // - "+00123.4", "-00123.4" (con signo y ceros al inicio)
    // - " 123.4kg", "123.4 kg" (con unidad)
    // - "ST,GS,123.4" (formato con prefijos)
    // - "+0000.00" (solo números con decimales)
    // - "US   123.45kg" (formato con espacios)
    // - "  123.45  " (con espacios alrededor)
    
    console.log('🔍 Parseando formato estándar:', data);
    
    // Patrón 1: Buscar número con signo opcional
    const pattern1 = data.match(/([+-]?\s*\d+\.?\d*)/);
    if (pattern1) {
      const cleaned = pattern1[1].replace(/\s/g, ''); // Remover espacios
      const numValue = parseFloat(cleaned);
      
      if (!isNaN(numValue) && numValue !== 0) {
        console.log('✅ Formato estándar detectado:', numValue);
        return {
          value: numValue,
          unit: 'kg',
          raw: data,
          timestamp: new Date(),
          stable: true,
        };
      }
    }
    
    // Patrón 2: Buscar después de delimitadores comunes (ST, GS, US, etc.)
    const pattern2 = data.match(/(?:ST|GS|US|NET|GROSS)[,:\s]+([+-]?\d+\.?\d*)/i);
    if (pattern2) {
      const numValue = parseFloat(pattern2[1]);
      if (!isNaN(numValue) && numValue !== 0) {
        console.log('✅ Formato con delimitador detectado:', numValue);
        return {
          value: numValue,
          unit: 'kg',
          raw: data,
          timestamp: new Date(),
          stable: true,
        };
      }
    }
    
    return null;
  }, []);

  // Coordinador de parseo (Intenta Bernalo primero para mantener compatibilidad)
  const parseWeight = useCallback((data: string): WeightReading | null => {
    try {
      const cleaned = data.trim();
      if (!cleaned) return null;

      // 1. Intentar formato Bernalo (Mantiene comportamiento actual)
      const bernaloResult = parseBernaloFormat(cleaned);
      if (bernaloResult) return bernaloResult;

      // 2. Intentar formato Estándar (Nueva mejora)
      const standardResult = parseStandardFormat(cleaned);
      if (standardResult) return standardResult;

      return null;
    } catch (err) {
      console.error('Error parsing weight:', err);
      return null;
    }
  }, [parseBernaloFormat, parseStandardFormat]);

  // Conectar a la balanza
  const connect = useCallback(async () => {
    console.log('🔌 Iniciando conexión a balanza...');
    
    // Verificar soporte
    if (!('serial' in navigator)) {
      const errorMsg = 'Web Serial API no está disponible. Use Chrome o Edge.';
      console.error('❌', errorMsg);
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    console.log('✅ Web Serial API disponible');

    try {
      console.log('📋 Solicitando puerto serial...');
      // Solicitar puerto al usuario
      const port = await navigator.serial.requestPort();
      console.log('✅ Puerto seleccionado:', port);

      console.log('⚙️ Configuración:', finalConfig);
      console.log('🔧 Abriendo puerto con configuración...');
      
      // Abrir puerto con configuración
      await port.open({
        baudRate: finalConfig.baudRate!,
        dataBits: finalConfig.dataBits!,
        stopBits: finalConfig.stopBits!,
        parity: finalConfig.parity!,
        bufferSize: finalConfig.bufferSize!,
        flowControl: finalConfig.flowControl!,
      });

      console.log('✅ Puerto abierto exitosamente');
      console.log('📖 Puerto readable:', port.readable !== null);
      console.log('✍️ Puerto writable:', port.writable !== null);

      portRef.current = port;
      setIsConnected(true);
      setError(null);
      toast.success('Balanza conectada correctamente');

      console.log('🎉 Conexión completada - startReading se ejecutará automáticamente');
      // El usuario debe llamar startReading() manualmente después de conectar
    } catch (err: any) {
      const errorMsg = err.name === 'NotFoundError'
        ? 'No se seleccionó ningún puerto'
        : `Error al conectar: ${err.message}`;

      console.error('❌ Error en conexión:', err);
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

  const publishLiveWeight = useCallback((value: number, unit: string, raw: string) => {
    const rounded = Math.round(value * 100) / 100;
    if (lastPublishedRef.current === rounded) return;
    lastPublishedRef.current = rounded;
    setCurrentWeight({ value: rounded, unit, raw, timestamp: new Date(), stable: true });
  }, []);

  // Iniciar lectura continua
  const startReading = useCallback(async () => {
    console.log('📚 startReading llamado');
    console.log('📚 portRef.current:', portRef.current !== null);
    console.log('📚 isReadingRef.current:', isReadingRef.current);
    
    if (!portRef.current) {
      console.error('❌ No hay puerto conectado');
      return;
    }
    
    if (isReadingRef.current) {
      console.warn('⚠️ Ya se está leyendo');
      return;
    }

    try {
      console.log('🚀 Iniciando lectura continua...');
      isReadingRef.current = true;
      setIsReading(true);

      const decoder = new TextDecoder();
      let buffer = '';
      console.log('🔤 Decoder creado');

      // Obtener reader del puerto
      if (!portRef.current.readable) {
        console.error('❌ Puerto no tiene readable stream');
        throw new Error('Puerto no tiene readable stream');
      }
      
      console.log('🎯 Obteniendo reader del puerto...');
      const reader = portRef.current.readable.getReader();
      readerRef.current = reader;
      console.log('✅ Reader obtenido, iniciando loop de lectura...');

      // Intentar enviar comandos de activación a la balanza
      if (portRef.current.writable) {
        try {
          console.log('📤 Intentando enviar comandos de activación...');
          const writer = portRef.current.writable.getWriter();
          
          // Comandos comunes para activar balanzas
          const commands = [
            'P\r\n',     // Print (común en muchas balanzas)
            'W\r\n',     // Weight (algunos modelos)
            'S\r\n',     // Send (algunos modelos)
            '\r\n',      // Simple CRLF
          ];
          
          for (const cmd of commands) {
            const data = new TextEncoder().encode(cmd);
            await writer.write(data);
            console.log('📤 Comando enviado:', cmd.trim() || '<CRLF>');
            await new Promise(resolve => setTimeout(resolve, 100)); // Esperar 100ms entre comandos
          }
          
          writer.releaseLock();
          console.log('✅ Comandos de activación enviados');
        } catch (writeErr) {
          console.warn('⚠️ No se pudieron enviar comandos:', writeErr);
        }
      }

      // Leer datos continuamente
      let readCount = 0;
      let noDataWarningShown = false;
      const startTime = Date.now();
      
      while (isReadingRef.current) {
        readCount++;
        if (readCount === 1) {
          console.log('🔄 Entrando en loop de lectura...');
        }
        if (readCount % 10 === 0) {
          console.log(`🔄 Ciclo de lectura #${readCount}`);
        }
        
        // Advertencia si no llegan datos después de 5 segundos
        if (!noDataWarningShown && Date.now() - startTime > 5000) {
          noDataWarningShown = true;
          console.warn('⚠️ ¡NO SE RECIBEN DATOS! Posibles causas:');
          console.warn('   1. BaudRate incorrecto (actual: 9600). Prueba: 4800, 19200');
          console.warn('   2. La balanza necesita un botón físico para enviar');
          console.warn('   3. La balanza necesita configuración en su panel');
          toast.warning('No se reciben datos de la balanza. Verifica la configuración.', { duration: 5000 });
        }
        
        try {
          const { value, done } = await reader.read();

          if (done) {
            console.log('🛑 Lectura terminada (done=true)');
            break;
          }
          
          if (!value || value.length === 0) {
            console.log('⚠️ Valor vacío recibido');
            continue;
          }
          
          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          const bernaloFrame = /=(-?)(\d+)\.(\d+)(?=[^\d])/g;
          let frame: RegExpExecArray | null;
          let consumed = 0;
          let lastValue: number | null = null;
          let lastFrameText = '';
          while ((frame = bernaloFrame.exec(buffer)) !== null) {
            const parsed = parseFloat(frame[2] + frame[3]) / 10;
            lastValue = frame[1] === '-' ? -parsed : parsed;
            consumed = bernaloFrame.lastIndex;
            lastFrameText = frame[0];
          }
          if (lastValue !== null) {
            buffer = buffer.slice(consumed);
            publishLiveWeight(lastValue, 'raw', lastFrameText);
            continue;
          }

          // Procesar líneas completas (terminadas en \r\n, \n, o \r)
          const lines = buffer.split(/[\r\n]+/);
          
          // El último elemento puede estar incompleto, guardarlo para el siguiente ciclo
          buffer = lines.pop() || '';
          
          // Procesar cada línea completa
          for (const line of lines) {
            if (!line.trim()) continue; // Saltar líneas vacías
            
            console.log('📝 Procesando línea:', line);
            
            const weight = parseWeight(line);
            if (weight) {
              console.log('⚖️ Peso detectado:', weight);

              publishLiveWeight(weight.value, weight.unit, weight.raw);
            } else {
              console.log('❌ No se pudo parsear línea:', line);
            }
          }

          // Si el buffer crece demasiado sin procesar (más de 500 caracteres), limpiarlo
          if (buffer.length > 500) {
            console.log('🧹 Buffer muy largo, limpiando...');
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
  }, [parseWeight, publishLiveWeight]);

  // Detener lectura
  const stopReading = useCallback(() => {
    isReadingRef.current = false;
    setIsReading(false);
  }, []);

  // Resetear el peso actual (útil cuando se selecciona un nuevo animal)
  const resetWeight = useCallback(() => {
    lastPublishedRef.current = null;
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

  // Enviar comando manual a la balanza
  const sendCommand = useCallback(async (command: string) => {
    if (!portRef.current?.writable) {
      console.warn('⚠️ Puerto no tiene writable stream');
      return;
    }

    try {
      console.log('📤 Enviando comando:', command);
      const writer = portRef.current.writable.getWriter();
      const data = new TextEncoder().encode(command);
      await writer.write(data);
      writer.releaseLock();
      console.log('✅ Comando enviado exitosamente');
      toast.success('Comando enviado a la balanza');
    } catch (err: any) {
      console.error('❌ Error al enviar comando:', err);
      toast.error(`Error al enviar comando: ${err.message}`);
    }
  }, []);

  // Iniciar lectura automática cuando se conecte
  useEffect(() => {
    console.log('🎬 useEffect de autostart - isConnected:', isConnected, 'portRef:', portRef.current !== null, 'isReading:', isReadingRef.current);
    
    if (isConnected && portRef.current && !isReadingRef.current) {
      console.log('🎬 Condiciones cumplidas, llamando startReading...');
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
    sendCommand, // Nueva función para enviar comandos manuales
  };
}
