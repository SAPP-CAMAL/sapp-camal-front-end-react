import { TransportType } from '@/features/transport-type/domain';
import { RegisterVehicle } from './register-vehicle';
import { Vehicle } from './vehicle';
import { VehicleDetail } from './vehicle-detail';
import { Person } from '@/features/people/domain';
import { VehicleType } from '@/features/vehicle-type/domain';
import { Specie } from '@/features/specie/domain';
import { Disinfectant } from '@/features/disinfectant/domain';

export interface DetailRegisterVehicleByDate {
	id: number;
	dosage: string;
	commentary: string;
	timeStar: string;
	timeEnd?: string;
	status: boolean;

	idSpecies: number;
	species: Specie;

	idDisinfectant: number;
	disinfectant: Disinfectant;

	idRegisterVehicle: number;
	registerVehicle: RegisterVehicle & {
		idSlaughterhouse: number;

		idShipping: number;
		shipping: {
			id: number;
			transportsProductsChannels: null;
			status: boolean;

			vehicleId: number;
			vehicle: VehicleData;

			personId: number;
			person: Person;
		};
	};
}

type VehicleData = Vehicle & {
	vehicleDetailId: number;
	vehicleDetail: VehicleDetail & {
		transportTypeId: number;
		transportType: TransportType;

		vehicleTypeId: number;
		vehicleType: VehicleType;
	};
};
