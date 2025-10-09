import { useQuery } from '@tanstack/react-query';
import { DISINFECTANT_LIST_TAG } from '../constants';
import { getAllDisinfectants } from '../server/db/disinfectant.service';

export function useDisinfectant() {
	const query = useQuery({
		queryKey: [DISINFECTANT_LIST_TAG],
		queryFn: () => getAllDisinfectants(),
	});

	return query;
}
