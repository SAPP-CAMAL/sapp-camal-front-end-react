import { http } from '@/lib/ky';
import { CommonHttpResponse } from '@/features/people/domain';
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
		.json<CreateDetailRegisterVehicleResponse>();
};

export const updateDetailRegisterVehicleService = async (idDetailRegisterVehicle: number | string, registerVehicle: UpdateDetailRegisterVehicle) => {
	return http
		.patch('v1/1.0.0/detail-register-vehicle/' + idDetailRegisterVehicle.toString(), {
			json: registerVehicle,
		})
		.json<UpdateDetailRegisterVehicleResponse>();
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
