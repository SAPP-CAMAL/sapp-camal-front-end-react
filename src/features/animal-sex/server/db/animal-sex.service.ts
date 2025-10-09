import { http } from '@/lib/ky';
import { CommonHttpResponse } from '@/features/people/domain';
import { AnimalSex } from '@/features/animal-sex/domain';

export const getAllAnimalSex = async () => {
	return http.get('v1/1.0.0/animal-sex/all').json<CommonHttpResponse<AnimalSex>>();
};
