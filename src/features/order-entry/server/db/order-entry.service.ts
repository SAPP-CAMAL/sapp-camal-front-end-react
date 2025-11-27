import { http } from '@/lib/ky';
import { CommonHttpResponse } from '@/features/people/domain';
import { AnimalStock, ProductStockItem, StockByIdsRequest } from '../../domain/order-entry.types';

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
