import { ShipperFormValues } from './shipper-form-values';

export type ShipperBasicData = ShipperFormValues & {
	/** @property id - The vehicle ID. */
	vehicleId: string;
	/** @property entryTime - The date of admission. */
	entryTime?: string;
	/** @property idDetailsRegisterVehicles - The ID of the details register vehicles. */
	idDetailsRegisterVehicles?: number;
};
