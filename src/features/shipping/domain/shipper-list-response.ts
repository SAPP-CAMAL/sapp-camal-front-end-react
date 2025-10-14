import { Specie } from '@/features/specie/domain';
import { Shipper } from './shipper';
import { CommonHttpResponsePagination, CreateOrUpdateHttpResponse } from '@/features/people/domain';

export interface ShipperFilter {
	page?: number;
	limit?: number;
	identification?: string;
	fullName?: string;
	plate?: string;
	transportType?: string;
	shippingStatus?: boolean;
	vehicleStatus?: boolean;
}

export type ShippersListResponse = CommonHttpResponsePagination<Shipper>;
export type ShipperResponse = CreateOrUpdateHttpResponse<Shipper>;

export interface DetailRegisterVehicleResponseByCodeAndIdShipping {
	id: number;
	idRegisterVehicle: number;
	idSpecies: number;
	idDisinfectant: number;
	dosage: string;
	commentary: string;
	timeStar: string;
	timeEnd: null;
	status: boolean;
	species: Specie;
	disinfectant: Disinfectant;
}

interface Disinfectant {
	id: number;
	name: string;
	description: string;
	status: boolean;
}
