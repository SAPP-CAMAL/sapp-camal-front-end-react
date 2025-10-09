import { ShipperBasicData } from '@/features/shipping/domain';

export interface DailyRegisterFormData {
	id?: number;
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
