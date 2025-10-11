import { Specie } from '@/features/specie/domain';
import { AnimalAdmissionItem as BaseAnimalAdmission } from '../context/reception-provider';
import { AnimalTransportForm as BaseAnimalTransport } from '../hooks/use-step-3-transport';

type SpecieItem = Specie & { certificateId: string };
type AnimalAdmissionItem = BaseAnimalAdmission & { certificateId: string };
type AnimalTransportForm = BaseAnimalTransport & { certificateId: string };


export const readAnimalAdmissionsFromLocalStorage = (): AnimalAdmissionItem[] => {
  return []; 
};

export const saveAnimalAdmissionsToLocalStorage = (animalAdmissions: AnimalAdmissionItem[]) => {
};
export const saveNewAnimalAdmissionToLocalStorage = (newAdmission: AnimalAdmissionItem) => {
};

export const removeAnimalAdmissionFromLocalStorage = (randomId: string) => {
};

export const saveConditionTransportInLocalStorage = (animalTransport: AnimalTransportForm) => {
};

export const readConditionTransportFromLocalStorage = (): AnimalTransportForm[] => {
  return []; 
};

export const saveSpeciesInLocalStorage = (species: SpecieItem) => {
};

export const readSpeciesFromLocalStorage = (): SpecieItem[] => {
  return []; 
};
