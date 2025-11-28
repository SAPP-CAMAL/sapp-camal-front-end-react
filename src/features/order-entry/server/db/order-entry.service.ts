import { http } from '@/lib/ky';
import { CommonHttpResponse } from '@/features/people/domain';
import { AnimalStock, ProductStockItem, StockByIdsRequest, SpecieProductConfig, OrderByIdAndDetailResponse } from '../../domain/order-entry.types';

export const getStockBySpecie = async (specieId: number) => {
	return http
		.get('v1/1.0.0/animal-product/stock-by-specie', {
			searchParams: { specieId: specieId.toString() },
		})
		.json<CommonHttpResponse<AnimalStock[]>>();
};

export const getStockByIds = async (request: StockByIdsRequest) => {
	return http
		.post('v1/1.0.0/animal-product/stock-by-ids', {
			json: request,
		})
		.json<CommonHttpResponse<ProductStockItem[]>>();
};

export const getSpecieProductsByCode = async (specieId: number, productTypeCode: "PRO" | "SUB") => {
	return http
		.get('v1/1.0.0/specie-product/by-specie-code', {
			searchParams: {
				specieId: specieId.toString(),
				productTypeCode: productTypeCode
			},
		})
		.json<CommonHttpResponse<SpecieProductConfig>>();
};

export const getOrderByIdAndDetail = async (id: number, idDetailSpecieCert: number) => {
	// La API SIEMPRE espera ambos parámetros
	const searchParams: Record<string, string> = {
		id: id.toString(),
		idDetailSpecieCert: idDetailSpecieCert.toString()
	};
	
	return http
		.get('v1/1.0.0/orders/by-id-and-id-detail-specie-cert', {
			searchParams,
		})
		.json<CommonHttpResponse<OrderByIdAndDetailResponse>>();
};

export interface SaveOrderRequest {
	idAddressee: number;
	idShipping: number;
	status: boolean;
	orderDetails: {
		idAnimalProduct: number;
	}[];
}

export interface SaveOrderResponse {
	id: number;
	idAddressee: number;
	idOrderStatus: number;
	idOrderType: number;
	idShipping: number;
	idVeterinarian: number;
	validityHours: number;
	status: boolean;
	userCreated: number;
	userOrigin: string;
	updatedAt: string | null;
	userUpdated: number | null;
	approvedDate: string | null;
	idApprovedBy: number | null;
	createdAt: string;
	nroVersion: number;
	requestedDate: string;
}

export const saveOrder = async (data: SaveOrderRequest) => {
	return http
		.post('v1/1.0.0/orders', {
			json: data,
		})
		.json<CommonHttpResponse<SaveOrderResponse>>();
};

export interface UpdateOrderDetailsRequest {
	orderDetails: {
		idAnimalProduct: number;
		status: boolean;
	}[];
}

export const updateOrderDetails = async (orderId: number, data: UpdateOrderDetailsRequest) => {
	return http
		.patch(`v1/1.0.0/orders/${orderId}`, {
			json: data,
		})
		.json<CommonHttpResponse<SaveOrderResponse>>();
};
