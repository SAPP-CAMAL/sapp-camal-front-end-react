import { useQuery } from '@tanstack/react-query';
import { getFinishTypeBySpecieId } from '../server/db/finish-type.service';

export const useFinishTypeBySpecies = (specieId: string | number) => {
	const query = useQuery({
		queryKey: ['finishTypeBySpecies', specieId],
		queryFn: () => getFinishTypeBySpecieId(specieId),
		initialData: { data: [], code: 200, message: 'initial data' },
	});

	return query;
};
