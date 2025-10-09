import { useQuery } from '@tanstack/react-query';
import { GetAllCorralGroup } from '../domain';
import { CORRAL_GROUP_LIST_TAG } from '../constants';
import { getAllCorralGroup } from '@/features/corral-group/server/db/corral-group.service';

export const useAllCorralGroup = () => {
	const query = useQuery({
		queryKey: [CORRAL_GROUP_LIST_TAG],
		queryFn: () => getAllCorralGroup(),
		initialData: { data: [] as GetAllCorralGroup[], code: 200, message: 'initial data' },
	});

	return query;
};
