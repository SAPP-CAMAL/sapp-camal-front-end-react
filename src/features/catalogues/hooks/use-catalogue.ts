import { useQuery } from "@tanstack/react-query";
import { getCatalogues } from "../server/db/catalogues.service";

export function useCatalogue(code: string) {
    const query = useQuery({
        queryKey: ["catalogues", code],
        queryFn: () => getCatalogues(code),
    })

    return query
}