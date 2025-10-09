/**
 * Represents a shipper entity responsible for transporting products.
 *
 * @property id - The shipping ID.
 * @property status - Indicates whether the shipper is active or inactive.
 * @property person - The person associated with the shipper.
 * @property vehicle - The vehicle used by the shipper.
 * @property transportsProductsChannels - The channels through which products are transported.
 */
export interface Shipper {
	/** @property id - The shipping ID. */
	id: number;
	/** @property status - Indicates whether the shipper is active or inactive. */
	status: boolean;
	/** @property person - The person associated with the shipper. */
	person: Person;
	/** @property vehicle - The vehicle used by the shipper. */
	vehicle: Vehicle;
	/** @property transportsProductsChannels - The channels through which products are transported. */
	transportsProductsChannels: TransportsProductsChannels;
}

interface Person {
	id: number;
	firstName: string;
	lastName: string;
	fullName: string;
	identification: string;
	code: string;
	identificationTypeId: number;
}

interface TransportsProductsChannels {
	channels: string;
	products: string;
	transportModes: string;
}

interface Vehicle {
	id: number;
	plate: string;
	model: string;
	color: string;
	brand: string;
	description: null;
	manufactureYear: number;
	status: boolean;
	vehicleDetail: VehicleDetail;
}

interface VehicleDetail {
	id: number;
	status: boolean;
	transportType: Type;
	vehicleType: Type;
}

interface Type {
	id: number;
	name: string;
	code: string;
	description: string;
}
