import { Origin } from '@/features/origin/domain';

export interface SaveScannedCertificateRequest {
	idOrigin: number;
	code: string;
	issueDate: string;
	placeOrigin: string;
	quantity: number;
	plateVehicle?: string;
	authorizedTo?: string;
	originAreaCode?: string;
	destinationAreaCode?: string;
	shippingsId?: number;
	status: boolean;
	idDetailsRegisterVehicles?: number;
}

export interface SaveScannedCertificateResponse {
	id: number;
	code: string;
	issueDate: string;
	idOrigin: number;
	placeOrigin: string;
	quantity: number;
	status: boolean;
	plateVehicle: string;
	authorizedTo: string;
	originAreaCode: string;
	destinationAreaCode: string;
	userCreated: number;
	userOrigin: string;
	updatedAt: string | null;
	userUpdated: string | null;
	createdAt: string;
	nroVersion: number;
	shippingsId: number;
	/** The URL of the certificate file. */
	urlFile?: string;
	/** The status of the certificate. */
	origin?: Origin;
}
