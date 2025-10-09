import { http } from '@/lib/ky';
import { FinishType } from '../../domain';
import { CommonHttpResponse } from '@/features/people/domain';

export const getFinishTypeBySpecieId = (idSpecie: string | number) => {
	return http
		.get(`v1/1.0.0/finish-type/by-specie`, {
			searchParams: { idSpecie },
		})
		.json<CommonHttpResponse<FinishType>>();
};
