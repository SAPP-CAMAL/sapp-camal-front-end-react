import { useQuery } from '@tanstack/react-query';
import { ANIMAL_SEX_LIST_TAG } from '../constants';
import { getAllAnimalSex } from '../server/db/animal-sex.service';

export const useAllAnimalSex = () => {
	const query = useQuery({
		queryKey: [ANIMAL_SEX_LIST_TAG],
		queryFn: () => getAllAnimalSex(),
		initialData: { data: [], code: 200, message: 'initial data' },
	});

	return query;
};
