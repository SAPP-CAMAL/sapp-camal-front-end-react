import { useQuery } from '@tanstack/react-query';
import { Corral } from '../domain';
import { CORRAL_BY_TYPE_AND_GROUP_LIST_TAG } from '../constants';
import { getCorralsByTypeAndGroup } from '../server/db/corral.service';

interface Props {
	corralTypeId?: string | number;
	groupId?: string | number;
}

export const useAllCorralsByTypeAndGroup = ({ corralTypeId, groupId }: Props) => {
	const query = useQuery({
		queryKey: [CORRAL_BY_TYPE_AND_GROUP_LIST_TAG, { corralTypeId, groupId }],
		queryFn: () => getCorralsByTypeAndGroup(corralTypeId?.toString() || '', groupId?.toString() || ''),
		initialData: { data: [] as Corral[], code: 200, message: 'initial data' },
	});

	return query;
};
