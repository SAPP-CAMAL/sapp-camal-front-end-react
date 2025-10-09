'use client';

import { ReceptionProvider } from '@/features/reception/context/reception-provider';
import { AnimalAdmissionSteps } from '@/features/reception/components/animal-admission-steps';

export const AnimalAdmissionPage = () => {
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
