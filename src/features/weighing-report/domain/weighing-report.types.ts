/**
 * Tipos para el reporte de pesajes
 */

// Filtros para el reporte de pesaje (enviados en el POST)
export interface WeighingReportFilters {
    idWeighingStage: number;
    idSpecie: number;
    startDate: string;
    endDate: string;
    brandName?: string; // Opcional - para buscar por nombre de marca
    specieName?: string;
}

// Estructura de la respuesta de la API
export interface WeighingReportApiItem {
    id: number;
    grossWeight: string;
    netWeight: string;
    animalWeighing: {
        id: number;
        detailsSpeciesCertificate: {
            id: number;
            code: string; // Código del animal
            detailCertificateBrands: {
                id: number;
                productiveStage: {
                    id: number;
                    name: string;
                };
                detailsCertificateBrand: {
                    id: number;
                    slaughterDate: string;
                    brand: {
                        id: number;
                        name: string;
                        introducer: {
                            id: number;
                            user: {
                                id: number;
                                person: {
                                    id: number;
                                    fullName: string;
                                };
                            };
                        };
                    };
                };
            };
        };
        specie: {
            id: number;
            name: string;
        };
    };
}

// Respuesta de la API
export interface GetWeighingReportApiResponse {
    code: number;
    message: string;
    data: WeighingReportApiItem[];
}

// Datos del animal individual
export interface WeighingReportAnimal {
    id: number;
    code: string; // Código del animal
    grossWeight: number;
    netWeight: number;
    productiveStage: string;
    specieName: string;
}

// Grupo de animales por marca
export interface WeighingReportBrandGroup {
    brandId: number;
    brandName: string;
    animals: WeighingReportAnimal[];
}

// Datos del introductor
export interface WeighingReportIntroducer {
    id: number;
    fullName: string;
    slaughterDate: string;
}

// Fila del reporte (agrupado por introductor -> marca)
export interface WeighingReportRow {
    id: number;
    introducer: WeighingReportIntroducer;
    brands: WeighingReportBrandGroup[];
}

// Respuesta transformada para el componente
export interface GetWeighingReportResponse {
    code: number;
    message: string;
    data: WeighingReportRow[];
}
