import { useQuery } from '@tanstack/react-query';
import { Origin } from '@/features/origin/domain';
import { ORIGIN_LIST_TAG } from '@/features/origin/constants';
import { getAllOrigins } from '@/features/origin/server/db/origin.service';

export const useAllOrigins = () => {
	const query = useQuery({
		queryKey: [ORIGIN_LIST_TAG],
		queryFn: () => getAllOrigins(),
		initialData: { data: [] as Origin[], code: 200, message: 'initial data' },
	});

	return query;
};
