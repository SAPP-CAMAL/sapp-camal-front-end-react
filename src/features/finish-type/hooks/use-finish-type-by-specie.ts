import { useQuery } from '@tanstack/react-query';
import { getFinishTypeBySpecieId } from '../server/db/finish-type.service';

export const useFinishTypeBySpecies = (specieId: string | number) => {
	const isEnabled = !!specieId && specieId !== 0;
	
	const query = useQuery({
		queryKey: ['finishTypeBySpecies', specieId],
		queryFn: () => getFinishTypeBySpecieId(specieId),
		enabled: isEnabled,
		staleTime: 5 * 60 * 1000, // 5 minutos
		gcTime: 10 * 60 * 1000, // 10 minutos en caché
	});

	// Devolver datos por defecto si la consulta está deshabilitada o no hay datos
	if (!isEnabled || !query.data) {
		return {
			...query,
			data: { data: [], code: 200, message: 'No data' },
		};
	}

	return query;
};
