import { http } from '@/lib/ky';
import { CommonHttpResponse } from '@/features/people/domain';
import { AnimalSex } from '@/features/animal-sex/domain';

export const getAllAnimalSex = async () => {
	return http.get('v1/1.0.0/animal-sex/all').json<CommonHttpResponse<AnimalSex>>();
};

export type CreateAnimalSexBody = {
	code: string;
	name: string;
	description?: string;
	status?: boolean;
};

export type UpdateAnimalSexBody = Partial<CreateAnimalSexBody>;

export function createAnimalSexService(body: CreateAnimalSexBody) {
	return http.post('v1/1.0.0/animal-sex', { json: body }).json();
}

export function updateAnimalSexService(id: number, body: UpdateAnimalSexBody) {
	return http.patch(`v1/1.0.0/animal-sex/${id}`, { json: body }).json();
}

export function deleteAnimalSexService(id: number) {
	return http.delete(`v1/1.0.0/animal-sex/${id}`);
}
