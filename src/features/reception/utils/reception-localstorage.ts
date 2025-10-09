import { Specie } from '@/features/specie/domain';
import { AnimalAdmissionItem as BaseAnimalAdmission } from '../context/reception-provider';
import { AnimalTransportForm as BaseAnimalTransport } from '../hooks/use-step-3-transport';

type SpecieItem = Specie & { certificateId: string };
type AnimalAdmissionItem = BaseAnimalAdmission & { certificateId: string };
type AnimalTransportForm = BaseAnimalTransport & { certificateId: string };

export const readAnimalAdmissionsFromLocalStorage = (): AnimalAdmissionItem[] => {
	try {
		const data = localStorage.getItem('animalAdmissions');
		return data ? JSON.parse(data) : [];
	} catch (error) {
		// console.error('Error reading animal admissions from localStorage:', error);
		return [];
	}
};

export const saveAnimalAdmissionsToLocalStorage = (animalAdmissions: AnimalAdmissionItem[]) => {
	try {
		localStorage.setItem('animalAdmissions', JSON.stringify(animalAdmissions));
	} catch (error) {
		// console.error('Error saving animal admissions to localStorage:', error);
	}
};

export const saveNewAnimalAdmissionToLocalStorage = (newAdmission: AnimalAdmissionItem) => {
	try {
		let currentAdmissions = readAnimalAdmissionsFromLocalStorage();

		const admission = currentAdmissions.find(admission => admission.animalAdmission.id === newAdmission.animalAdmission.id);

		if (admission) {
			currentAdmissions = currentAdmissions.filter(admission => admission.animalAdmission.id !== newAdmission.animalAdmission.id);
			newAdmission = {
				randomId: admission.randomId,
				state: admission.state,
				certificateId: admission.certificateId,
				animalAdmission: { ...admission.animalAdmission, ...newAdmission.animalAdmission },
				isOpen: false,
			};
		}

		currentAdmissions.push(newAdmission);
		localStorage.setItem('animalAdmissions', JSON.stringify(currentAdmissions));
	} catch (error) {
		// console.error('Error saving new animal admission to localStorage:', error);
	}
};

export const removeAnimalAdmissionFromLocalStorage = (randomId: string) => {
	try {
		const currentAdmissions = readAnimalAdmissionsFromLocalStorage();
		const updatedAdmissions = currentAdmissions.filter(admission => admission.randomId !== randomId);
		localStorage.setItem('animalAdmissions', JSON.stringify(updatedAdmissions));
	} catch (error) {
		// console.error('Error removing animal admission from localStorage:', error);
	}
};

export const saveConditionTransportInLocalStorage = (animalTransport: AnimalTransportForm) => {
	try {
		const currentTransport = readConditionTransportFromLocalStorage();

		const updatedTransport = currentTransport.map(transport =>
			transport.certificateId === animalTransport.certificateId ? { ...transport, ...animalTransport } : transport
		);

		if (!updatedTransport.some(transport => transport.certificateId === animalTransport.certificateId)) {
			updatedTransport.push(animalTransport);
		}

		localStorage.setItem('animalTransport', JSON.stringify(updatedTransport));
	} catch (error) {
		// console.error('Error saving animal transport to localStorage:', error);
	}
};

export const readConditionTransportFromLocalStorage = (): AnimalTransportForm[] => {
	try {
		const data = localStorage.getItem('animalTransport');

		if (!data) return [];

		return JSON.parse(data) as AnimalTransportForm[];
	} catch (error) {
		// console.error('Error reading animal transport from localStorage:', error);
		return [];
	}
};

export const saveSpeciesInLocalStorage = (species: SpecieItem) => {
	try {
		const currentSpecies = readSpeciesFromLocalStorage();

		const updatedSpecies = currentSpecies.map(existingSpecie =>
			existingSpecie.certificateId === species.certificateId ? { ...existingSpecie, ...species } : existingSpecie
		);

		if (!updatedSpecies.some(specie => specie.certificateId === species.certificateId)) {
			updatedSpecies.push(species);
		}

		localStorage.setItem('species', JSON.stringify(updatedSpecies));
	} catch (error) {
		// console.error('Error saving species to localStorage:', error);
	}
};

export const readSpeciesFromLocalStorage = (): SpecieItem[] => {
	try {
		const data = localStorage.getItem('species');

		if (!data) return [];

		return JSON.parse(data) as SpecieItem[];
	} catch (error) {
		// console.error('Error reading species from localStorage:', error);
		return [];
	}
};
