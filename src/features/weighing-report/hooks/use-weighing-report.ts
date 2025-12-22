import { useQuery } from "@tanstack/react-query";
import { getWeighingReport } from "../server";
import type { WeighingReportFilters } from "../domain";

const WEIGHING_REPORT_TAG = "weighing-report";

export function useWeighingReport(filters: WeighingReportFilters | null) {
    return useQuery({
        queryKey: [WEIGHING_REPORT_TAG, filters],
        queryFn: () => getWeighingReport(filters!),
        // Solo ejecutar si tenemos los filtros requeridos
        enabled:
            !!filters &&
            !!filters.idWeighingStage &&
            !!filters.idSpecie &&
            !!filters.startDate &&
            !!filters.endDate,
        staleTime: 1000 * 60 * 5, // 5 minutos
        gcTime: 1000 * 60 * 10, // 10 minutos en caché
    });
}
