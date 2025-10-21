import { useQuery } from '@tanstack/react-query';
import { BRANDS_BY_FILTER } from '../constants';
import { getBrandByFilter } from '../server/db/brand.service';
import { BrandFilter } from '../domain';

export const useBrandByFilter = (filters: Partial<BrandFilter>) => {
	const hasSearchParams = (filters.fullName?.length || 0) > 0 || (filters.name?.length || 0) > 0 || (filters.identification?.length || 0) > 0;
	const isEnabled = !!filters.idSpecie && hasSearchParams;

	const query = useQuery({
		queryKey: [BRANDS_BY_FILTER, filters],
		queryFn: async () => {
			const brands = await getBrandByFilter(filters);

			return brands.data.map(brand => ({
				...brand,
				introducer: {
					id: brand?.introducer.id,
					name: brand?.introducer.user?.person?.fullName,
					identification: brand?.introducer.user?.person?.identification,
				},
			}));
		},
		enabled: isEnabled,
		staleTime: 30 * 1000, // 30 segundos - búsquedas pueden cambiar
		gcTime: 2 * 60 * 1000, // 2 minutos en caché
	});

	// Devolver array vacío si la consulta está deshabilitada
	if (!isEnabled) {
		return {
			...query,
			data: [],
		};
	}

	return query;
};
