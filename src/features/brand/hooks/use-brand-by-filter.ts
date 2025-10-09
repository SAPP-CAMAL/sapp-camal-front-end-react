import { useQuery } from '@tanstack/react-query';
import { BRANDS_BY_FILTER } from '../constants';
import { getBrandByFilter } from '../server/db/brand.service';
import { BrandFilter } from '../domain';

export const useBrandByFilter = (filters: Partial<BrandFilter>) => {
	const query = useQuery({
		queryKey: [BRANDS_BY_FILTER, filters],
		queryFn: async () => {
			const isEmptyFilters = (filters.fullName?.length || 0) < 1 && (filters.name?.length || 0) < 1 && (filters.identification?.length || 0) < 1;
			if (!!filters.idSpecie && isEmptyFilters) return [];

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
		initialData: [],
	});

	return query;
};
