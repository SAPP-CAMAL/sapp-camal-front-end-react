import { useQuery } from '@tanstack/react-query';
import { getOrderByIdAndDetail } from '../server/db/order-entry.service';
import { OrderByIdAndDetailResponse } from '../domain/order-entry.types';

export const useOrderByIdAndDetail = (id: number | null, idDetailSpecieCert: number | null) => {
    const query = useQuery({
        queryKey: ['order-by-id-and-detail', id, idDetailSpecieCert],
        queryFn: () => {
            // IMPORTANTE: La API siempre espera AMBOS parámetros
            if (!id || !idDetailSpecieCert) {
                throw new Error('Ambos parámetros (id e idDetailSpecieCert) son requeridos');
            }
            return getOrderByIdAndDetail(id, idDetailSpecieCert);
        },
        // Solo ejecutar cuando AMBOS parámetros estén disponibles
        enabled: !!id && !!idDetailSpecieCert,
    });

    return query;
};
