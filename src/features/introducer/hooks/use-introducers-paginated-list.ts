import { useQuery } from '@tanstack/react-query';
import { ALL_INTRODUCERS_PAGINATED } from '../constant';
import { IntroducersPaginatedFilters } from '../domain';
import { getIntroducersPaginated } from '../server/db/introducer.service';

export const useIntroducersPaginatedList = (filters: IntroducersPaginatedFilters) => {
	const query = useQuery({
		queryKey: [ALL_INTRODUCERS_PAGINATED, filters],
		queryFn: () => getIntroducersPaginated(filters),
		initialData: { data: { items: [] as any[], meta: {} }, code: 200, message: 'initial data' },
	});

	return query;
};
