import { useQuery } from '@tanstack/react-query';
import { BedType } from '../domain';
import { BED_TYPE_LIST_TAG } from '../constants';
import { getAllBedTypes } from '../server/db/bed-type.service';


export const useAllBedType = () => {
	const query = useQuery({
		queryKey: [BED_TYPE_LIST_TAG],
		queryFn: () => getAllBedTypes(),
		initialData: { data: [] as BedType[], code: 200, message: 'initial data' },
	});

	return query;
};
