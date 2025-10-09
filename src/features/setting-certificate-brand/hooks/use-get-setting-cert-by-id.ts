import { useQuery } from '@tanstack/react-query';
import { getCertBrandById } from '../server/db/setting-cert-brand.service';

export const useGetCertBrandById = (id: string) => {
	const query = useQuery({
		queryKey: ['certBrand', id],
		queryFn: () => getCertBrandById(id),
	});

	return query;
};
