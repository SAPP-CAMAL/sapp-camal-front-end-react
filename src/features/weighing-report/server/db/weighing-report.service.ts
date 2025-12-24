import { http } from "@/lib/ky";
import type {
    WeighingReportFilters,
    GetWeighingReportApiResponse,
    GetWeighingReportResponse,
    WeighingReportApiItem,
    WeighingReportRow,
    WeighingReportBrandGroup,
} from "../../domain";

/**
 * Transforma los datos de la API agrupándolos por introductor y luego por marca
 */
function transformApiResponse(
    apiData: WeighingReportApiItem[]
): WeighingReportRow[] {
    // Primer nivel: agrupar por introductor
    const groupedByIntroducer = new Map<number, WeighingReportRow>();

    for (const item of apiData) {
        const introducer =
            item.animalWeighing.detailsSpeciesCertificate.detailCertificateBrands
                .detailsCertificateBrand.brand.introducer;
        const introducerId = introducer.id;

        const brand =
            item.animalWeighing.detailsSpeciesCertificate.detailCertificateBrands
                .detailsCertificateBrand.brand;
        const productiveStage =
            item.animalWeighing.detailsSpeciesCertificate.detailCertificateBrands
                .productiveStage;

        // Crear el registro del introductor si no existe
        if (!groupedByIntroducer.has(introducerId)) {
            groupedByIntroducer.set(introducerId, {
                id: introducerId,
                introducer: {
                    id: introducerId,
                    fullName: introducer.user.person.fullName,
                },
                brands: [],
            });
        }

        const row = groupedByIntroducer.get(introducerId)!;

        // Buscar si ya existe un grupo para esta marca
        let brandGroup = row.brands.find((b) => b.brandId === brand.id);

        if (!brandGroup) {
            // Crear nuevo grupo de marca
            brandGroup = {
                brandId: brand.id,
                brandName: brand.name,
                animals: [],
            };
            row.brands.push(brandGroup);
        }

        // Agregar el animal al grupo de la marca
        brandGroup.animals.push({
            id: item.id,
            code: item.animalWeighing.detailsSpeciesCertificate.code,
            grossWeight: parseFloat(item.grossWeight),
            netWeight: parseFloat(item.netWeight),
            productiveStage: productiveStage.name,
            specieName: item.animalWeighing.specie.name,
        });
    }

    return Array.from(groupedByIntroducer.values());
}

/**
 * Servicio para obtener el reporte de pesajes
 * Usa POST con los filtros en el body
 */
export async function getWeighingReport(
    filters: WeighingReportFilters
): Promise<GetWeighingReportResponse> {
    const body: Record<string, unknown> = {
        idWeighingStage: filters.idWeighingStage,
        idSpecie: filters.idSpecie,
        startDate: filters.startDate,
        endDate: filters.endDate,
    };

    // Solo agregar brandName si tiene valor (para buscar por marca)
    if (filters.brandName && filters.brandName.trim().length > 0) {
        body.brandName = filters.brandName.trim();
    }

    const response = await http
        .post("v1/1.0.0/detail-animal-weighing/report-weighing", {
            json: body,
        })
        .json<GetWeighingReportApiResponse>();

    // Transformar los datos agrupándolos por introductor y marca
    const transformedData = transformApiResponse(response.data);

    return {
        code: response.code,
        message: response.message,
        data: transformedData,
    };
}

/**
 * Servicio para descargar el reporte de pesajes en PDF
 */
export async function downloadWeighingPdfReport(
    filters: WeighingReportFilters
): Promise<{ blob: Blob; filename: string }> {
    const body: Record<string, unknown> = {
        idWeighingStage: filters.idWeighingStage,
        idSpecie: filters.idSpecie,
        startDate: filters.startDate,
        endDate: filters.endDate,
    };

    // Solo agregar brandName si tiene valor
    if (filters.brandName && filters.brandName.trim().length > 0) {
        body.brandName = filters.brandName.trim();
    }

    const response = await http.post(
        "v1/1.0.0/detail-animal-weighing/weighing-pdf-report",
        { json: body }
    );

    const blob = await response.blob();
    const contentDisposition = response.headers.get("content-disposition") || "";

    const filenameMatch = contentDisposition.match(
        /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
    );
    const defaultFilename = `Reporte-Pesajes-${filters.startDate}-${filters.endDate}.pdf`;
    const filename =
        filenameMatch?.[1]?.replace(/['"]/g, "") || defaultFilename;

    return { blob, filename };
}
