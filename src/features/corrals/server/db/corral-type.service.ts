import { http } from '@/lib/ky';

export interface CorralTypeResponse {
  code: number;
  message: string;
  data: {
    id: number;
    description: string;
    code: string;
    status: boolean;
  };
}

export const getCorralTypeById = async (id: number) => {
  return http
    .get('v1/1.0.0/corral-type', {
      searchParams: { id }
    })
    .json<CorralTypeResponse>();
};
