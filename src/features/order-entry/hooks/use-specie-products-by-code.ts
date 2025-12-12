import { useQuery } from '@tanstack/react-query';
import { getSpecieProductsByCode } from '../server/db/order-entry.service';
import { SpecieProductConfig } from '../domain/order-entry.types';

export const useSpecieProductsByCode = (specieId: number | null, productTypeCode: "PRO" | "SUB") => {
    const query = useQuery({
        queryKey: ['specie-products-by-code', specieId, productTypeCode],
        queryFn: () => getSpecieProductsByCode(specieId!, productTypeCode),
        enabled: !!specieId,
    });

    return query;
};
