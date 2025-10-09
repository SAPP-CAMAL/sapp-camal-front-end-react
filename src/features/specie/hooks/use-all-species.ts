import { useQuery } from '@tanstack/react-query';
import { SPECIES_LIST_TAG } from '@/features/specie/constants';
import { getAllSpecies } from '@/features/specie/server/db/specie.service';

export const useAllSpecies = () => {
	const query = useQuery({
		queryKey: [SPECIES_LIST_TAG],
		queryFn: () => getAllSpecies(),
		initialData: { data: [], code: 200, message: 'initial data' },
	});

	return query;
};
