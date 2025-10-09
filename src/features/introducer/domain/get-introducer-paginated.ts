import { Introducer } from './introducer';
import { Brand } from '@/features/brand/domain';
import { CommonHttpResponsePagination } from '@/features/people/domain';

export interface IntroducersPaginatedFilters {
	fullName?: string;
	identification?: string;
	brandName?: string;
	species?: string[];
	status?: boolean;
	page?: number;
	limit?: number;
}

export type IntroducersPaginated = CommonHttpResponsePagination<Introducer & { brands: Brand[] }>;
