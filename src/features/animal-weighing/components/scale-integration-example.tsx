'use client';

import { useState } from 'react';
import { SerialScaleReader } from '@/components/serial-scale-reader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Save, Trash2 } from 'lucide-react';

interface WeightRecord {
  animalId: string;
  weight: number;
  unit: string;
  timestamp: Date;
  stage: string;
}

export function ScaleIntegrationExample() {
  const [animalId, setAnimalId] = useState('');
  const [stage, setStage] = useState<'EN_PIE' | 'DESPUES_FAENAMIENTO' | 'DISTRIBUCION'>('EN_PIE');
  const [capturedWeight, setCapturedWeight] = useState<number | null>(null);
  const [unit, setUnit] = useState('kg');
  const [isSaving, setIsSaving] = useState(false);

  // Capturar peso estable de la balanza
  const handleStableWeight = (weight: number, weightUnit: string) => {
    setCapturedWeight(weight);
    setUnit(weightUnit);
    toast.success(`Peso capturado: ${weight} ${weightUnit}`);
  };

  // Guardar peso en la API
  const saveWeight = async () => {
    if (!animalId || !capturedWeight) {
      toast.error('Ingrese ID del animal y capture un peso');
      return;
    }

    setIsSaving(true);

    try {
      // Aquí va tu llamada a la API
      const response = await fetch('/api/animal-weighing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          animalId,
          weight: capturedWeight,
          unit,
          stage,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error('Error al guardar');

      toast.success('Peso guardado correctamente');
      
      // Limpiar formulario
      setAnimalId('');
      setCapturedWeight(null);
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Lector de balanza */}
      <div>
        <SerialScaleReader
          onStableWeight={handleStableWeight}
          showRawData={false}
        />
      </div>

      {/* Formulario de registro */}
      <Card>
        <CardHeader>
          <CardTitle>Registrar Peso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* ID del Animal */}
          <div>
            <Label htmlFor="animalId">ID del Animal</Label>
            <Input
              id="animalId"
              value={animalId}
              onChange={(e) => setAnimalId(e.target.value)}
              placeholder="Ej: A-001"
            />
          </div>

          {/* Etapa */}
          <div>
            <Label htmlFor="stage">Etapa de Pesaje</Label>
            <select
              id="stage"
              value={stage}
              onChange={(e) => setStage(e.target.value as any)}
              className="w-full h-10 px-3 rounded-md border border-gray-300"
            >
              <option value="EN_PIE">En Pie</option>
              <option value="DESPUES_FAENAMIENTO">Después de Faenamiento</option>
              <option value="DISTRIBUCION">Distribución</option>
            </select>
          </div>

          {/* Peso capturado */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Label>Peso Capturado</Label>
            <div className="flex items-baseline gap-2 mt-1">
              {capturedWeight !== null ? (
                <>
                  <span className="text-3xl font-bold text-blue-900">
                    {capturedWeight.toFixed(2)}
                  </span>
                  <span className="text-xl font-semibold text-blue-700">
                    {unit.toUpperCase()}
                  </span>
                </>
              ) : (
                <span className="text-gray-400">
                  Esperando peso estable de la balanza...
                </span>
              )}
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-2">
            <Button
              onClick={saveWeight}
              disabled={!animalId || !capturedWeight || isSaving}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Guardando...' : 'Guardar Peso'}
            </Button>
            <Button
              onClick={() => {
                setCapturedWeight(null);
                setAnimalId('');
              }}
              variant="outline"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
