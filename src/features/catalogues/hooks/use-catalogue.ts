import { useQuery } from "@tanstack/react-query";
import { getCatalogues } from "../server/db/catalogues.service";
import { getCompanyTypes } from "@/features/visitor-log/server/db/visitor-log.service";

export function useCatalogue(code: string) {
    const query = useQuery({
        queryKey: ["catalogues", code],
        queryFn: () => getCatalogues(code),
    })

    return query
}

export function useCompanyTypes() {
    return useQuery({
        queryKey: ["company-types"],
        queryFn: () => getCompanyTypes(),
    })
}