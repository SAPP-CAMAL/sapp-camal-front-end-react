import { http } from '@/lib/ky';
import type { Certificate } from '@/features/certificate/domain';
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

export const getCertificateByCodeService = (code: string) => {
	return http.get('v1/1.0.0/certificate/by-code?code=' + code).json<CreateOrUpdateHttpResponse<Certificate>>();
};
