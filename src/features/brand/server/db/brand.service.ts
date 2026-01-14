import { http } from '@/lib/ky';
import { BRANDS_BY_FILTER } from '@/features/brand/constants';
import type { CommonHttpResponse } from '@/features/people/domain/index';
import type { BrandByFilterResponse, BrandFilter } from '@/features/brand/domain';

export const getBrandByFilter = (filters: Partial<BrandFilter>) => {
	return http
		.post('v1/1.0.0/brands/by-filter', {
			json: filters,
			next: { tags: [BRANDS_BY_FILTER] },
		})
		.json<CommonHttpResponse<BrandByFilterResponse>>();
};

export const updateBrandsStatus = (brandId: string | number, status: boolean) => {
	return http.patch(`v1/1.0.0/brands/update-status/${brandId.toString()}/${status}`);
};

export const getBrandsByName = (name: string) => {
	return http.get(`v1/1.0.0/brands/by-name/${encodeURIComponent(name)}`).json<{
		code: number;
		message: string;
		data: Array<{
			id: number;
			name: string;
			description: string | null;
			introducerId: number;
			status: boolean;
			introducer: {
				id: number;
				user: {
					id: number;
					person: {
						identification: string;
						fullName: string;
					};
				};
			};
		}>;
	}>();
};