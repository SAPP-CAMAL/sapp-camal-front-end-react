/**
 * Represents the form values for a shipper in the shipping domain.
 */
export interface ShipperFormValues {
	/** The shipping ID. */
	id: number;

	/** The person ID. */
	personId: number;

	/** The first name of person. */
	firstName: string;

	/** The last name of person. */
	lastName: string;

	/** The identifier for the type of identification document. */
	identificationTypeId: string;

	/** The identification number of person. */
	identification: string;

	/** The license plate of the vehicle. */
	plate: string;

	/** The identifier for the type of vehicle. */
	vehicleTypeId: string;

	/** The type of vehicle. */
	vehicleType: string;

	/** The identifier for the type of transport. */
	transportTypeId: string;

	/** The type of transport. */
	transportType: string;
	fullName: string;
}

/** Use all field to create new shipper. */
export interface CreateShipperValues {
	/** The identification of person, required if you use [vehicleId]. */
	identification?: string;

	/** The first name of person, required if you use [vehicleId]. */
	firstName?: string;

	/** The last name of person, required if you use [vehicleId]. */
	lastName?: string;

	/** The identifier for the type of vehicle, required if you use [vehicleID]. */
	identificationTypeId?: number;

	/** The type of vehicle, required if you use [personID]. */
	vehicleTypeId?: number;

	/** The type of transport, required if you use [personID]. */
	transportTypeId?: number;

	/** The plate of vehicle, required if you use [personID]. */
	plate?: string;

	/** The id required to add a new person to vehicle. */
	vehicleId?: number;

	/** The id required to add a new vehicle to person. */
	personId?: number;
}
