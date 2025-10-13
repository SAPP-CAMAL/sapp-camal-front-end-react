import { Origin } from '@/features/origin/domain';
import { Specie } from '@/features/specie/domain';

/**
 * Represents the structure of a valid Certificate saved in DB.
 *
 * @property id - The unique identifier of the certificate.
 * @property code - The certificate code.
 * @property issueDate - The date the certificate was issued.
 * @property placeOrigin - The place of origin of the certificate.
 * @property quantity - The quantity of items covered by the certificate.
 * @property plateVehicle - The vehicle plate associated with the certificate (nullable).
 * @property authorizedTo - The name of the entity or person authorized by the certificate (nullable).
 * @property originAreaCode - The area code representing the origin location (nullable).
 * @property destinationAreaCode - The area code representing the destination location (nullable).
 * @property shippingsId - The shipping ID associated with the certificate (nullable).
 * @property urlFile - The URL of the certificate file (nullable).
 * @property origin - The origin details associated with the certificate (nullable).
 * @property status - The status of the certificate (active/inactive).
 */
export interface Certificate {
	/** The unique identifier of the certificate. */
	id: number;
	/** The origin identifier of the certificate. */
	idOrigin: number;
	/** The certificate code. */
	code: string;
	/** The issue date of the certificate. */
	issueDate: string;
	/** The place of origin of the certificate. */
	placeOrigin: string;
	/** The quantity associated with the certificate. */
	quantity: number;
	/** The vehicle's plate associated with the certificate, if any. */
	plateVehicle: string;
	/** The entity authorized by the certificate, if any. */
	authorizedTo: string;
	/** The origin area code of the certificate, if any. */
	originAreaCode: string;
	/** The destination area code of the certificate, if any. */
	destinationAreaCode: string;
	/** The shipping ID associated with the certificate, if any. */
	shippingsId?: number;
	/** The URL of the certificate file. */
	urlFile?: string;
	/** The status of the certificate. */
	origin?: Origin;
	/** The status of the certificate. */
	status: boolean;
}
