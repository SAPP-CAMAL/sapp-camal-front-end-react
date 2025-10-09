import { useQuery } from '@tanstack/react-query';
import { PRODUCTIVE_LIST_TAG } from '../constants';
import { getProductiveStagesBySpecie } from '../server/db/productive-stage.service';

export const useProductiveStagesBySpecie = (specieId: string | number) => {
	const query = useQuery({
		queryKey: [PRODUCTIVE_LIST_TAG],
		queryFn: () => getProductiveStagesBySpecie(specieId.toString()),
		initialData: { data: [], code: 200, message: 'initial data' },
	});

	return query;
};
