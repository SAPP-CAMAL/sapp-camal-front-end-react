import { http } from "@/lib/ky";

interface ResponseCatalogues {
    code: number;
    message: string;
    data: Datum[];
}

interface Datum {
    catalogueTypeId: number;
    catalogueTypeCode: string;
    catalogueId: number;
    code: string;
    name: string;
    description: string;
}

export function getCatalogues(code: string) {
    return http.get("v1/1.0.0/catalogues/catalogue-type/values-by-code",
        { searchParams: { code } }).json<ResponseCatalogues>()
}
