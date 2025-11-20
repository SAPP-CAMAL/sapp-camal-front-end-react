import { http } from '@/lib/ky';
import { CommonHttpResponse } from '@/features/people/domain';
import { CreateOrUpdateHttpResponse } from '../../../people/domain/index';
import {
	CreateDetailRegisterVehicle,
	CreateDetailRegisterVehicleResponse,
	DetailRegisterVehicleByDate,
	UpdateDetailRegisterVehicle,
	UpdateDetailRegisterVehicleResponse,
	UpdateRegisterVehicle,
} from '@/features/vehicles/domain';

export const createRegisterVehicleService = async (idShipping: number | string, registerVehicle: CreateDetailRegisterVehicle) => {
	return http
		.post('v1/1.0.0/detail-register-vehicle/' + idShipping.toString(), {
			json: registerVehicle,
		})
		.json<CreateOrUpdateHttpResponse<CreateDetailRegisterVehicleResponse>>();
};

export const updateDetailRegisterVehicleService = async (idDetailRegisterVehicle: number | string, registerVehicle: UpdateDetailRegisterVehicle) => {
	return http
		.patch('v1/1.0.0/detail-register-vehicle/' + idDetailRegisterVehicle.toString(), {
			json: registerVehicle,
		})
		.json<CreateOrUpdateHttpResponse<UpdateDetailRegisterVehicleResponse>>();
};

export const updateRegisterVehicleService = async (idRegisterVehicle: number | string, registerVehicle: Partial<UpdateRegisterVehicle>) => {
	return http
		.patch('v1/1.0.0/register-vehicle/' + idRegisterVehicle.toString(), {
			json: registerVehicle,
		})
		.json<UpdateDetailRegisterVehicleResponse>();
};

export const setRegisterVehicleTimeOut = (idRegisterVehicle: number | string) => {
	return http.patch('v1/1.0.0/detail-register-vehicle/register-time-out/' + idRegisterVehicle.toString());
};

export const getRegisterVehicleByDate = async (date: string) => {
	return http.get('v1/1.0.0/detail-register-vehicle/by-register-date?recordDate=' + date).json<CommonHttpResponse<DetailRegisterVehicleByDate>>();
};

export const getRegisterVehicleByDateReport = async (
	registerDate: string,
	typeReport: 'EXCEL' | 'PDF'
): Promise<{ blob: Blob; filename: string; contentType: string }> => {
	const response = await http.get('v1/1.0.0/detail-register-vehicle/report-by-date', {
		searchParams: { registerDate, typeReport },
	});

	const blob = await response.blob();
	const contentType = response.headers.get('content-type') || '';
	const contentDisposition = response.headers.get('content-disposition') || '';

	const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
	const defaultFilename = `Registro-de-vehiculos-${registerDate}.${typeReport.toLowerCase() === 'excel' ? 'xlsx' : 'pdf'}`;
	const filename = filenameMatch?.[1]?.replace(/['"]/g, '') || defaultFilename;

	return { blob, filename, contentType };
};
