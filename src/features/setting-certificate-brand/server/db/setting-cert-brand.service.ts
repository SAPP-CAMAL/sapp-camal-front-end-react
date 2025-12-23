import { http } from '@/lib/ky';
import { CommonHttpResponse, CreateOrUpdateHttpResponse } from '@/features/people/domain';
import {
	SaveCertificateBrand,
	SaveCertificateBrandResponse,
	SettingCertBrandByCertificateId,
	SettingCertBrandByID,
} from '@/features/setting-certificate-brand/domain';

export const saveCertBrand = (data: SaveCertificateBrand) => {
	return http
		.post('v1/1.0.0/setting-cert-brand', {
			json: data,
		})
		.json<CreateOrUpdateHttpResponse<SaveCertificateBrandResponse>>();
};

export const updateCertBrand = (settingCertBrandId: string, data: Partial<SaveCertificateBrand>) => {
	return http
		.patch(`v1/1.0.0/setting-cert-brand/${settingCertBrandId}`, {
			json: data,
		})
		.json<CreateOrUpdateHttpResponse<SaveCertificateBrandResponse>>();
};

export const deleteCertBrand = (settingCertBrandId: string) => {
	return http.delete(`v1/1.0.0/setting-cert-brand/${settingCertBrandId}`);
};

export const getCertBrandByCertificateId = async (certificateId: string): Promise<CommonHttpResponse<SettingCertBrandByCertificateId>> => {
	try {
		return await http
			.get('v1/1.0.0/setting-cert-brand/by-certificate-id', {
				searchParams: { certificateId },
			})
			.json<CommonHttpResponse<SettingCertBrandByCertificateId>>();
	} catch (error: unknown) {
		// Si la API devuelve 400 con "NOT FOUND", retornar array vacío
		if (error && typeof error === 'object' && 'response' in error) {
			const httpError = error as { response: Response };
			if (httpError.response?.status === 400) {
				return { data: [] as SettingCertBrandByCertificateId[], code: 200, message: 'No records found' };
			}
		}
		throw error;
	}
};

export const getCertBrandById = (id: number | string) => {
	return http
		.get('v1/1.0.0/setting-cert-brand', {
			searchParams: { id: id.toString() },
		})
		.json<CreateOrUpdateHttpResponse<SettingCertBrandByID>>();
};

export const getSimpleSettingCertBrandByCertificateId = async (id: number | string): Promise<CommonHttpResponse<SaveCertificateBrandResponse>> => {
	try {
		return await http
			.get('v1/1.0.0/setting-cert-brand/registers/by-certificate-id', {
				searchParams: { certificateId: id.toString() },
			})
			.json<CommonHttpResponse<SaveCertificateBrandResponse>>();
	} catch (error: unknown) {
		// Si la API devuelve 400 con "NOT FOUND", retornar array vacío
		if (error && typeof error === 'object' && 'response' in error) {
			const httpError = error as { response: Response };
			if (httpError.response?.status === 400) {
				return { data: [] as SaveCertificateBrandResponse[], code: 200, message: 'No records found' };
			}
		}
		throw error;
	}
};

export const validateSettingCertBrandCodesGeneration = (idSpecies: number | string, admissionDate: string) => {
	return http
		.get('v1/1.0.0/setting-cert-brand/validate-codes-generation', {
			searchParams: { idSpecie: idSpecies.toString(), admissionDate },
		})
		.json<CreateOrUpdateHttpResponse<boolean>>();
};

export const getAnimalTicketById = async (idSettingCertificateBrand: number | string) => {
	try {
		const response = await http.get('v1/1.0.0/setting-cert-brand/animal-ticket-by-id', {
			searchParams: { idSettingCertificateBrand },
		});

		const blob = await response.blob();
		const contentType = response.headers.get('content-type') || '';
		const contentDisposition = response.headers.get('content-disposition') || '';

		const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
		const defaultFilename = `Ticket-Animal-${idSettingCertificateBrand}.pdf`;
		const filename = filenameMatch?.[1]?.replace(/['"]/g, '') || defaultFilename;

		return { blob, filename, contentType };
	} catch (error) {
		throw error;
	}
};
