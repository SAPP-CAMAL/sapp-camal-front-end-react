import { ShipperFormValues } from './shipper-form-values';

export type ShipperBasicData = ShipperFormValues & {
	/** @property id - The vehicle ID. */
	vehicleId: string;
};
