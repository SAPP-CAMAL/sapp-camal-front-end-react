import { http } from '@/lib/ky';
import { CommonHttpResponse, CreateOrUpdateHttpResponse } from '@/features/people/domain';
import { SHIPPING_LIST_TAG } from '@/features/shipping/constants';
import {
	CreateShipperValues,
	DetailRegisterVehicleResponseByCodeAndIdShipping,
	DetailRegisterVehicleResponseById,
	Shipper,
	ShipperFilter,
	ShipperResponse,
	ShippersListResponse,
} from '@/features/shipping/domain';

export const getShippersByFilterService = async (filters: ShipperFilter = {}): Promise<ShippersListResponse> => {
	try {
		return await http
			.post('v1/1.0.0/shipping/shipping-by-filter', {
				next: { tags: [SHIPPING_LIST_TAG] },
				json: filters,
			})
			.json<ShippersListResponse>();
	} catch (error: unknown) {
		// Si la API devuelve 400 cuando no hay resultados, retornar lista vacía
		if (error && typeof error === 'object' && 'response' in error) {
			const httpError = error as { response: Response };
			if (httpError.response?.status === 400) {
				return { data: { items: [], meta: {} }, code: 200, message: 'No records found' } as ShippersListResponse;
			}
		}
		throw error;
	}
};

export const getShippersByIdService = (id: number | string) => {
	return http
		.get(`v1/1.0.0/shipping`, {
			next: { tags: [SHIPPING_LIST_TAG, id.toString()] },
			searchParams: { id: id.toString() },
		})
		.json<ShipperResponse>();
};

export const getDetailRegisterVehicleByIdShippingAndCertificateCodeService = (idShipping: number | string, certificateCode: string) => {
	return http
		.get(`v1/1.0.0/detail-register-vehicle/by-shipping-certificate`, {
			next: { tags: ['detail-register-vehicle-by-certificate'] },
			searchParams: { idShipping, certificateCode },
		})
		.json<CreateOrUpdateHttpResponse<DetailRegisterVehicleResponseByCodeAndIdShipping>>();
};

export const getDetailRegisterVehicleById = (idDetailRegisterVehicle: number) => {
	return http
		.get(`v1/1.0.0/detail-register-vehicle`, {
			next: { tags: ['detail-register-vehicle-by-certificate'] },
			searchParams: { id: idDetailRegisterVehicle },
		})
		.json<CreateOrUpdateHttpResponse<DetailRegisterVehicleResponseById>>();
};

export const createShipperService = async (newShipper: CreateShipperValues) => {
	return http
		.post('v1/1.0.0/shipping/create-person-vehicle', {
			json: newShipper,
		})
		.json<CreateOrUpdateHttpResponse<Shipper>>();
};

export const updateShipperService = async (id: number, updateShipper: CreateShipperValues) => {
	return http
		.patch('v1/1.0.0/shipping/update-information/' + id.toString(), {
			json: updateShipper,
		})
		.json<CreateOrUpdateHttpResponse<Shipper>>();
};
