import { useQuery } from '@tanstack/react-query';
import { PRODUCTIVE_LIST_TAG } from '../constants';
import { getProductiveStagesBySpecie } from '../server/db/productive-stage.service';

export const useProductiveStagesBySpecie = (specieId: string | number) => {
	const isEnabled = !!specieId && specieId !== 0;
	
	const query = useQuery({
		queryKey: [PRODUCTIVE_LIST_TAG, specieId],
		queryFn: () => getProductiveStagesBySpecie(specieId.toString()),
		enabled: isEnabled,
		staleTime: 5 * 60 * 1000, // 5 minutos - los datos no cambian frecuentemente
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
