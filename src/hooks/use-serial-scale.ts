import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';

console.log('🚀 [SERIAL-HOOK-V7] Conexión Directa a 9600 baud');

declare global {
  interface Navigator { serial: Serial; }
  interface Serial {
    requestPort(): Promise<SerialPort>;
    getPorts(): Promise<SerialPort[]>;
  }
  interface SerialPort {
    open(options: SerialOptions): Promise<void>;
    close(): Promise<void>;
    readable: ReadableStream<Uint8Array> | null;
    writable: WritableStream<Uint8Array> | null;
    setSignals?(signals: { requestToSend?: boolean; dataTerminalReady?: boolean }): Promise<void>;
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
  baudRate: 9600,
  dataBits: 8,
  stopBits: 1,
  parity: 'none',
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
  const intervalTimerRef = useRef<NodeJS.Timeout | null>(null);

  const finalConfig = useRef({ ...DEFAULT_CONFIG, ...config }).current;

  useEffect(() => {
    setIsSupported(typeof window !== 'undefined' && 'serial' in navigator);
  }, []);

  const parseWeight = useCallback((data: string): WeightReading | null => {
    const cleaned = data.trim();
    if (!cleaned) return null;

    // Hiweigh X1 Adr=99: "00017.6" (ya sin el '=' porque lo usamos como separador)
    // También maneja: "00017.6", "0017.60", "17.6", etc.
    const numMatch = cleaned.match(/(\d+\.?\d*)/);
    if (numMatch) {
      const val = parseFloat(numMatch[1]);
      if (!isNaN(val)) {
        return { value: val, unit: 'kg', raw: cleaned, timestamp: new Date(), stable: true };
      }
    }

    return null;
  }, []);

  const connect = useCallback(async () => {
    if (!('serial' in navigator)) {
      toast.error('Web Serial API no disponible');
      return;
    }

    console.log('🔌 [V7] Solicitando puerto...');
    try {
      const port = await navigator.serial.requestPort();

      console.log('🔧 [V7] Abriendo puerto a 9600...');
      await port.open({
        baudRate: finalConfig.baudRate!,
        dataBits: finalConfig.dataBits!,
        stopBits: finalConfig.stopBits!,
        parity: finalConfig.parity!,
        bufferSize: 255,
        flowControl: finalConfig.flowControl!,
      });

      // Activamos DTR y RTS por si el cable lo necesita
      try {
        if (port.setSignals) await port.setSignals({ requestToSend: true, dataTerminalReady: true });
        console.log('✅ Señales DTR/RTS activadas');
      } catch (e) { }

      portRef.current = port;
      setIsConnected(true);
      setError(null);
      toast.success('Balanza conectada correctamente');
    } catch (err: any) {
      const errorMsg = err.name === 'NotFoundError' ? 'No se seleccionó ningún puerto' : `Error al conectar: ${err.message}`;
      setError(errorMsg);
      toast.error(errorMsg);
      console.error('Connection error:', err);
    }
  }, [finalConfig]);

  const disconnect = useCallback(async () => {
    isReadingRef.current = false;
    if (readerRef.current) {
      try { await readerRef.current.cancel(); readerRef.current.releaseLock(); } catch (e) { }
      readerRef.current = null;
    }
    if (portRef.current) {
      try { await portRef.current.close(); } catch (e) { }
      portRef.current = null;
    }
    setIsConnected(false);
    setIsReading(false);
    setCurrentWeight(null);
    toast.info('Balanza desconectada');
  }, []);

  const startReading = useCallback(async () => {
    if (!portRef.current || isReadingRef.current) return;
    console.log('🚀 [V7] Iniciando loop de lectura a 9600 baud...');

    try {
      isReadingRef.current = true;
      setIsReading(true);

      const reader = portRef.current.readable!.getReader();
      readerRef.current = reader;
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let timerLog = Date.now();

      while (isReadingRef.current) {
        try {
          // Advertencia cada 8 segundos si no recibe nada
          if (Date.now() - timerLog > 8000) {
            console.warn('⚠️ No han entrado datos en 8s. Revisa el cruce TX/RX de los pines 2 y 3 del cable.');
            timerLog = Date.now();
          }

          const { value, done } = await reader.read();
          if (done) break;
          if (!value) continue;

          timerLog = Date.now(); // Resetea el tiempo al recibir datos

          const chunk = decoder.decode(value, { stream: true });
          const hex = Array.from(value).map(b => b.toString(16).padStart(2, '0')).join(' ');

          console.log(`📥 [V7] Hex: [${hex}] | Str: "${chunk.replace(/\r/g, '\\r').replace(/\n/g, '\\n')}"`);

          buffer += chunk;

          // La Hiweigh X1 usa '=' como separador de mensajes (no \r\n)
          // Formato: =00017.6=00017.6=00017.6...
          // Separamos por '=' y procesamos cada segmento completo
          const segments = buffer.split('=');
          // El último segmento puede estar incompleto, lo dejamos en el buffer
          buffer = segments.pop() || '';

          for (const segment of segments) {
            if (!segment) continue; // Segmentos vacíos por '=' al inicio
            const weight = parseWeight(segment);
            if (weight) {
              const rounded = Math.round(weight.value * 100) / 100;
              weightBufferRef.current.push(rounded);

              if (!intervalTimerRef.current) {
                intervalTimerRef.current = setTimeout(() => {
                  if (weightBufferRef.current.length > 0) {
                    const freq: { [k: number]: number } = {};
                    weightBufferRef.current.forEach(n => freq[n] = (freq[n] || 0) + 1);
                    let max = 0, most = weightBufferRef.current[0];
                    for (const [v, f] of Object.entries(freq)) {
                      if (f > max) { max = f; most = parseFloat(v); }
                    }
                    setCurrentWeight({ ...weight, value: most, timestamp: new Date() });
                  }
                  weightBufferRef.current = [];
                  intervalTimerRef.current = null;
                }, 1000);
              }
            }
          }

          if (buffer.length > 50) buffer = '';
        } catch (e) { break; }
      }
    } catch (err: any) {
      console.error('Error de lectura V7:', err);
    } finally {
      isReadingRef.current = false;
      setIsReading(false);
    }
  }, [parseWeight]);

  useEffect(() => {
    if (isConnected && portRef.current && !isReadingRef.current) {
      startReading();
    }
  }, [isConnected, startReading]);

  return {
    isConnected,
    isReading,
    currentWeight,
    error,
    isSupported,
    connect,
    disconnect,
    startReading,
    resetWeight: () => {
      setCurrentWeight(null);
      weightBufferRef.current = [];
      if (intervalTimerRef.current) { clearTimeout(intervalTimerRef.current); intervalTimerRef.current = null; }
    },
  };
}
