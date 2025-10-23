import type { PostmortemFilterData } from "../domain/save-postmortem.types";

// Re-exportar la función de fecha local desde lib para mantener compatibilidad
export { getLocalDateString } from "@/lib/formatDate";

/**
 * Obtiene los IDs únicos de introductores que tienen datos de postmortem
 */
export const getIntroductorIdsWithPostmortem = (
    postmortemData: PostmortemFilterData[] | undefined
): number[] => {
    if (!postmortemData) return [];

    const uniqueIds = new Set<number>();
    postmortemData.forEach((record) => {
        uniqueIds.add(
            record.detailsSpeciesCertificate.detailCertificateBrands.idSettingCertificateBrands
        );
    });

    return Array.from(uniqueIds);
};

/**
 * Cuenta cuántos animales tienen una enfermedad específica para un introductor
 * @param postmortemData - Datos de postmortem
 * @param idSettingCertificateBrands - ID del introductor (certId)
 * @param idSpeciesDisease - ID de la enfermedad
 * @returns Número de animales con esa enfermedad
 */
export const countAnimalsWithDisease = (
    postmortemData: PostmortemFilterData[] | undefined,
    idSettingCertificateBrands: number,
    idSpeciesDisease: number
): number => {
    if (!postmortemData) return 0;

    // Filtrar los registros de postmortem que pertenecen a este introductor
    const introductorRecords = postmortemData.filter(
        (record) =>
            record.detailsSpeciesCertificate.detailCertificateBrands.idSettingCertificateBrands ===
            idSettingCertificateBrands
    );

    // Contar cuántos animales tienen esta enfermedad específica
    const count = introductorRecords.filter((record) =>
        record.subProductPostmortem.some(
            (sub) => sub.idSpeciesDisease === idSpeciesDisease
        )
    ).length;

    return count;
};

/**
 * Cuenta cuántos animales tienen decomiso total para un introductor
 */
export const countAnimalsWithTotalConfiscation = (
    postmortemData: PostmortemFilterData[] | undefined,
    idSettingCertificateBrands: number
): number => {
    if (!postmortemData) return 0;

    const introductorRecords = postmortemData.filter(
        (record) =>
            record.detailsSpeciesCertificate.detailCertificateBrands.idSettingCertificateBrands ===
            idSettingCertificateBrands
    );

    const count = introductorRecords.filter((record) =>
        record.productPostmortem.some((prod) => prod.isTotalConfiscation === true)
    ).length;

    return count;
};

/**
 * Cuenta cuántos animales tienen decomiso parcial para un introductor
 */
export const countAnimalsWithPartialConfiscation = (
    postmortemData: PostmortemFilterData[] | undefined,
    idSettingCertificateBrands: number
): number => {
    if (!postmortemData) return 0;

    const introductorRecords = postmortemData.filter(
        (record) =>
            record.detailsSpeciesCertificate.detailCertificateBrands.idSettingCertificateBrands ===
            idSettingCertificateBrands
    );

    const count = introductorRecords.filter((record) =>
        record.productPostmortem.some((prod) => prod.isTotalConfiscation === false)
    ).length;

    return count;
};
