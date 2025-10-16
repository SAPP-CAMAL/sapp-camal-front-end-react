import { ShipperBasicData } from '@/features/shipping/domain';

export interface DailyRegisterFormData {
	/** detail register vehicle id */
	id?: number;
	/** register vehicle id */
	idRegisterVehicle?: number;
	shipper?: ShipperBasicData;
	transportedSpecie: number;
	disinfectant: string;
	dosage: string;
	admissionApplicationTime: string;
	departureApplicationTime: string;
	observations: string;
	fullName: string;
	identification: string;
	plate: string;
	showShipperAlert?: boolean;
}
