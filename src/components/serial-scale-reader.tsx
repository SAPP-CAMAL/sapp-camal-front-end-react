/**
 * Componente para conectar y leer datos de balanza serial
 * Compatible con Bernalo X1 y otras balanzas industriales
 */

'use client';

import { useEffect } from 'react';
import { useSerialScale } from '@/hooks/use-serial-scale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Scale, Plug, PlugZap, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SerialScaleReaderProps {
  onWeightRead?: (weight: number, unit: string) => void;
  onStableWeight?: (weight: number, unit: string) => void;
  autoConnect?: boolean;
  showRawData?: boolean;
}

export function SerialScaleReader({
  onWeightRead,
  onStableWeight,
  autoConnect = false,
  showRawData = false,
}: SerialScaleReaderProps) {
  const {
    isConnected,
    isReading,
    currentWeight,
    error,
    isSupported,
    connect,
    disconnect,
  } = useSerialScale();

  // Notificar cuando hay nueva lectura
  useEffect(() => {
    if (currentWeight && onWeightRead) {
      onWeightRead(currentWeight.value, currentWeight.unit);
    }

    if (currentWeight?.stable && onStableWeight) {
      onStableWeight(currentWeight.value, currentWeight.unit);
    }
  }, [currentWeight, onWeightRead, onStableWeight]);

  if (!isSupported) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Tu navegador no soporta Web Serial API. Por favor usa Chrome o Edge.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-blue-600" />
            <CardTitle>Balanza Serial</CardTitle>
          </div>
          <Badge variant={isConnected ? 'default' : 'secondary'}>
            {isConnected ? (
              <>
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Conectada
              </>
            ) : (
              'Desconectada'
            )}
          </Badge>
        </div>
        <CardDescription>
          Conecta tu balanza Bernalo X1 vía puerto serial o USB
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Botones de conexión */}
        <div className="flex gap-2">
          {!isConnected ? (
            <Button onClick={connect} className="flex-1">
              <Plug className="h-4 w-4 mr-2" />
              Conectar Balanza
            </Button>
          ) : (
            <Button onClick={disconnect} variant="outline" className="flex-1">
              <PlugZap className="h-4 w-4 mr-2" />
              Desconectar
            </Button>
          )}
        </div>

        {/* Error */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Lectura actual */}
        {isConnected && (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                {isReading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                ) : (
                  <Scale className="h-5 w-5 text-blue-600" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-600">Peso Actual</p>
                  {currentWeight ? (
                    <div className="flex items-center gap-2">
                      <p className="text-3xl font-bold text-blue-900">
                        {currentWeight.value.toFixed(2)}
                      </p>
                      <p className="text-xl font-semibold text-blue-700">
                        {currentWeight.unit.toUpperCase()}
                      </p>
                      {currentWeight.stable && (
                        <Badge variant="default" className="bg-green-600">
                          Estable
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <p className="text-2xl font-bold text-gray-400">
                      Esperando lectura...
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Información adicional */}
            {currentWeight && (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-2 bg-gray-50 rounded border">
                  <p className="text-gray-600">Última actualización</p>
                  <p className="font-medium">
                    {currentWeight.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                <div className="p-2 bg-gray-50 rounded border">
                  <p className="text-gray-600">Estado</p>
                  <p className="font-medium">
                    {currentWeight.stable ? 'Estable' : 'En movimiento'}
                  </p>
                </div>
              </div>
            )}

            {/* Datos crudos (debug) */}
            {showRawData && currentWeight && (
              <details className="text-xs">
                <summary className="cursor-pointer text-gray-600 hover:text-gray-900">
                  Ver datos crudos
                </summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded overflow-x-auto">
                  {currentWeight.raw}
                </pre>
              </details>
            )}
          </div>
        )}

        {/* Instrucciones */}
        {!isConnected && (
          <div className="text-sm text-gray-600 space-y-2 p-3 bg-gray-50 rounded-lg">
            <p className="font-semibold">Instrucciones:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Conecta la balanza Bernalo X1 al puerto USB</li>
              <li>Haz clic en "Conectar Balanza"</li>
              <li>Selecciona el puerto serial en el diálogo</li>
              <li>Los pesos se leerán automáticamente</li>
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
