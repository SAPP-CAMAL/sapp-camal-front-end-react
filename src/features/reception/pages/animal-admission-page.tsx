'use client';

import { useEffect } from 'react';
import { ReceptionProvider } from '@/features/reception/context/reception-provider';
import { AnimalAdmissionSteps } from '@/features/reception/components/animal-admission-steps';
import { clearReceptionStorage } from '../utils/clear-reception-storage';

export const AnimalAdmissionPage = () => {
  // Clear any existing data from local storage when the component mounts
  useEffect(() => {
    clearReceptionStorage();
  }, []);

  return (
    <ReceptionProvider>
      {/* Title */}
      <div className='mb-4'>
        <h1 className='text-2xl font-bold mb-2'>Registro de Ingreso de Animales</h1>
        <p className='text-muted-foreground'>Complete los siguientes pasos para registrar el ingreso de animales</p>
      </div>

      {/* Animal admission steps  */}
      <AnimalAdmissionSteps />
    </ReceptionProvider>
  );
};
