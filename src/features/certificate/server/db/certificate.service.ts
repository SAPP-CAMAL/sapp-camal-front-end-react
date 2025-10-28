import { http } from '@/lib/ky';
import type { Certificate, UpdateCertificateShipperRequest } from '@/features/certificate/domain';
import type { CreateOrUpdateHttpResponse } from '@/features/people/domain';
import type { SaveScannedCertificateRequest, SaveScannedCertificateResponse } from '@/features/certificate/domain';

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
	const response = await http.get('v1/1.0.0/certificate/certificates-by-code?code=' + code).json<CreateOrUpdateHttpResponse<Certificate[]>>();
	
	// La API ahora devuelve un array, tomamos el primer elemento
	return {
		...response,
		data: response.data && response.data.length > 0 ? response.data[0] : undefined
	} as CreateOrUpdateHttpResponse<Certificate>;
};

export const getCertificatesByCodeService = async (code: string) => {
	return http.get('v1/1.0.0/certificate/certificates-by-code?code=' + code).json<CreateOrUpdateHttpResponse<Certificate[]>>();
};

export const updateCertificateShipperService = async (certificateId: string | number, request: UpdateCertificateShipperRequest) => {
	return http
		.patch('v1/1.0.0/certificate/' + certificateId.toString(), {
			json: request,
		})
		.json<CreateOrUpdateHttpResponse<Certificate>>();
};
