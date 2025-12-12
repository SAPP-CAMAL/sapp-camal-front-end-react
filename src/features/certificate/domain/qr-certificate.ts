/**
 * Represents the base structure of a QR Certificate.
 *
 * @property authorizedTo - The name of the entity or person authorized by the certificate.
 * @property originAreaCode - The area code representing the origin location.
 * @property destinationAreaCode - The area code representing the destination location.
 * @property totalProducts - The total number of products covered by the certificate.
 * @property validUntil - The expiration date of the certificate.
 * @property vehicle - The vehicle plate.
 */
interface BaseQrCertificate {
	/** The name of the entity or person authorized by the certificate. */
	authorizedTo: string;
	/** The area code representing the origin location. */
	originAreaCode: string;
	/** The area code representing the destination location. */
	destinationAreaCode: string;
	/** The total number of products covered by the certificate. */
	totalProducts: number;
	/** The expiration date of the certificate. */
	validUntil: string;
	/** The vehicle plate */
	vehicle: string;
}

/**
 * Represents the structure of a QR Certificate for Variant 1.
 *
 * @property czpmNumber - The qr certificate code.
 * @property authorizedTo - The name of the entity or person authorized by the certificate.
 * @property originAreaCode - The area code representing the origin location.
 * @property destinationAreaCode - The area code representing the destination location.
 * @property totalProducts - The total number of products covered by the certificate.
 * @property validUntil - The expiration date of the certificate.
 * @property vehicle - The vehicle plate.
 */
export interface QrCertificateVariant1 extends BaseQrCertificate {
	/** The qr certificate code. */
	czpmNumber: string;
}

/**
 * Represents the structure of a QR Certificate for Variant 2.
 *
 * @property czpmNumber - The qr certificate code.
 * @property authorizedTo - The name of the entity or person authorized by the certificate.
 * @property originAreaCode - The area code representing the origin location.
 * @property destinationAreaCode - The area code representing the destination location.
 * @property totalProducts - The total number of products covered by the certificate.
 * @property totalSubProducts - The total number of sub products covered by the certificate.
 * @property validUntil - The expiration date of the certificate.
 * @property vehicle - The vehicle plate.
 */
export interface QrCertificateVariant2 extends BaseQrCertificate {
	/** The qr certificate code. */
	csmiNumber: string;
	/** The total subProducts for variant 2. */
	totalSubProducts: number;
}

type FieldsToOmitVariant3 = 'authorizedTo' | 'originAreaCode' | 'destinationAreaCode';
/**
 * Represents the structure of a QR Certificate for Variant 3.
 *
 * @property certificateNumber - The qr certificate code.
 * @property totalProducts - The total number of products covered by the certificate.
 * @property validUntil - The expiration date of the certificate.
 * @property vehicle - The vehicle plate.
 * @property origin - The origin location.
 * @property destination - The destination location.
 */
export interface QrCertificateVariant3 extends Omit<BaseQrCertificate, FieldsToOmitVariant3> {
	/** The qr certificate code/number. */
	certificateNumber: string;
	/** The origin location. */
	origin: string;
	/** The destination location. */
	destination: string;
}

/**
 * Represents the structure of a QR Certificate for Variant 4.
 *
 * @property czpmmNumber - The qr certificate code.
 * @property authorizedTo - The name of the entity or person authorized by the certificate.
 * @property originAreaCode - The area code representing the origin location.
 * @property destinationAreaCode - The area code representing the destination location.
 * @property totalProducts - The total number of products covered by the certificate.
 * @property totalSubProducts - The total number of sub products covered by the certificate.
 * @property validUntil - The expiration date of the certificate.
 * @property vehicle - The vehicle plate.
 */
export interface QrCertificateVariant4 extends BaseQrCertificate {
	/** The qr certificate code for variant 4. */
	czpmmNumber: string;
	/** The total subProducts for variant 4. */
	totalSubProducts: number;
}

/**
 * Represents the possible types of QR certificates.
 * This is a union type that can be one of the following variants:
 * - `QrCertificateVariant1`: Represents the first variant of the QR certificate.
 * - `QrCertificateVariant2`: Represents the second variant of the QR certificate.
 * - `QrCertificateVariant3`: Represents the third variant of the QR certificate.
 * - `QrCertificateVariant4`: Represents the fourth variant of the QR certificate.
 */
export type QrCertificateTypes = QrCertificateVariant1 | QrCertificateVariant2 | QrCertificateVariant3 | QrCertificateVariant4;
