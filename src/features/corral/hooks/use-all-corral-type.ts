import { useQuery } from '@tanstack/react-query';
import { CorralType } from '../domain';
import { ALL_CORRAL_TYPE_LIST_TAG } from '../constants';
import { getAllCorralType } from '../server/db/corral-type.service';

export const useAllCorralType = () => {
	const query = useQuery({
		queryKey: [ALL_CORRAL_TYPE_LIST_TAG],
		queryFn: () => getAllCorralType(),
		initialData: { data: [] as CorralType[], code: 200, message: 'initial data' },
	});

	return query;
};
