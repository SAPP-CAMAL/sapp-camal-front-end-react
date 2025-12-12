import { useQuery } from '@tanstack/react-query';
import { getStockBySpecie } from '../server/db/order-entry.service';
import { AnimalStock } from '../domain/order-entry.types';

export const useStockBySpecie = (specieId: number | null) => {
	const query = useQuery({
		queryKey: ['stock-by-specie', specieId],
		queryFn: () => getStockBySpecie(specieId!),
		enabled: !!specieId,
		initialData: { data: [] as AnimalStock[][], code: 200, message: 'initial data' },
	});

	return query;
};
