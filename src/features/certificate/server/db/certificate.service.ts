import { http } from '@/lib/ky';
import type { Certificate, UpdateCertificateShipperRequest } from '@/features/certificate/domain';
import type { CreateOrUpdateHttpResponse } from '@/features/people/domain';
import type { SaveScannedCertificateRequest, SaveScannedCertificateResponse } from '@/features/certificate/domain';

type DetailRegisterVehicle = {
	id: number;
	dosage: string;
	commentary: string;
	timeStar: string;
	timeEnd?: string;
	status: boolean;
	idSpecies: number;
	idDisinfectant: number;
	idRegisterVehicle: number;
};

export const saveScannedCertificateService = async (request: SaveScannedCertificateRequest) => {
	return http
		.post('v1/1.0.0/certificate', {
			json: request,
		})
		.json<CreateOrUpdateHttpResponse<SaveScannedCertificateResponse>>();
};

export const updateCertificateService = async (id: string | number, request: Omit<Certificate, 'id'>) => {
	return http
		.patch('v1/1.0.0/certificate/' + id.toString(), {
			json: request,
		})
		.json<CreateOrUpdateHttpResponse<Certificate>>();
};

export const getCertificateByCodeService = async (code: string) => {
	const response = await http
		.get('v1/1.0.0/certificate/certificates-by-code?code=' + code)
		.json<CreateOrUpdateHttpResponse<(Certificate & { detailsRegisterVehicle: DetailRegisterVehicle })[]>>();

	const data = response.data && response.data.length > 0 ? response.data.at(0) : undefined;

	return { ...response, data };
};

export const getCertificatesByCodeService = async (code: string) => {
	return http
		.get('v1/1.0.0/certificate/certificates-by-code?code=' + code)
		.json<CreateOrUpdateHttpResponse<(Certificate & { detailsRegisterVehicle: DetailRegisterVehicle })[]>>();
};

export const updateCertificateShipperService = async (certificateId: string | number, request: UpdateCertificateShipperRequest) => {
	return http
		.patch('v1/1.0.0/certificate/' + certificateId.toString(), {
			json: request,
		})
		.json<CreateOrUpdateHttpResponse<Certificate>>();
};
