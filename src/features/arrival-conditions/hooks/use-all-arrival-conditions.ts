import { useQuery } from '@tanstack/react-query';
import { ArrivalConditions } from '../domain';
import { ARRIVAL_CONDITIONS_LIST_TAG } from '../constants';
import { getAllArrivalConditions } from '../server/db/arrival-conditions.service';

export const useAllArrivalConditions = () => {
	const query = useQuery({
		queryKey: [ARRIVAL_CONDITIONS_LIST_TAG],
		queryFn: () => getAllArrivalConditions(),
		initialData: { data: [] as ArrivalConditions[], code: 200, message: 'initial data' },
	});

	return query;
};
