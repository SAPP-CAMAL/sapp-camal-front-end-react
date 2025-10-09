import type { Vehicle } from './vehicle';
import type { Specie } from '@/features/specie/domain';
import type { Disinfectant } from '@/features/disinfectant/domain';
import type { SlaughterHouse } from '@/features/slaughter-house/domain';

export interface CreateDetailRegisterVehicle {
	idSpecies: number;
	idDisinfectant: number;
	dosage: string;
	commentary: string;
	timeStar: string;
	timeEnd?: string;
	status: boolean;
}

export interface CreateDetailRegisterVehicleResponse {
	id: number;
	idRegisterVehicle: number;
	idSpecies: number;
	idDisinfectant: number;
	dosage: string;
	commentary: string;
	timeStar: string;
	timeEnd: string;
	status: boolean;
	specie: Omit<Specie, 'id'>;
	disinfect: Omit<Disinfectant, 'id'>;
	registerVehicle: RegisterVehicle;
}

interface RegisterVehicle {
	id: number;
	idShipping: number;
	idSlaughterhouse: number;
	checkinTime: string;
	checkoutTime: string;
	dateRegister: Date;
	shipping: { fullName: string; documentNumber: string };
	slaughterhause: Omit<SlaughterHouse, 'id'>;
	vehicle: Vehicle;
}
