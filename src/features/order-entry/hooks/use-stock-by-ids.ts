import { useQuery } from '@tanstack/react-query';
import { getStockByIds } from '../server/db/order-entry.service';
import { ProductStockItem, StockByIdsRequest } from '../domain/order-entry.types';

export const useStockByIds = (request: StockByIdsRequest | null) => {
	const query = useQuery({
		queryKey: ['stock-by-ids', request?.productTypeCode, request?.idDetailsSpeciesCertificate],
		queryFn: () => getStockByIds(request!),
		enabled: !!request && request.idDetailsSpeciesCertificate.length > 0,
		initialData: { data: [] as ProductStockItem[][], code: 200, message: 'initial data' },
	});

	return query;
};
