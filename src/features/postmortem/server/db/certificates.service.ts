import { http } from "@/lib/ky";
import type {
    GetCertificatesResponse,
    GetCertificatesRequest,
    CertificateBrand,
} from "../../domain/certificates.types";
import type { Introductor } from "../../domain/postmortem.types";

/**
 * Obtiene los certificados y marcas desde la API
 */
export const getCertificatesService = async (
    request: GetCertificatesRequest
): Promise<GetCertificatesResponse> => {
    try {
        const response = await http
            .post("v1/1.0.0/setting-cert-brand/certificates", {
                json: request,
                next: {
                    tags: ["postmortem", "certificates"],
                },
            })
            .json<GetCertificatesResponse>();

        return response;
    } catch (error) {
        console.error("Error fetching certificates:", error);
        throw error;
    }
};

/**
 * Mapea un CertificateBrand a nuestro tipo Introductor local
 */
export const mapCertificateBrandToIntroductor = (
    cert: CertificateBrand
): Introductor => {
    return {
        id: cert.id.toString(),
        nombre: cert.brand.introducer.user.person.fullName,
        marca: cert.brand.name,
        certificado: cert.certificate.code,
        animales: cert.codes,
        certId: cert.id, // Guardar el ID para obtener animales
    };
};

/**
 * Obtiene los introductores mapeados desde los certificados
 */
export const getIntroductoresFromCertificates = (
    certificates: CertificateBrand[]
): Introductor[] => {
    return certificates.map(mapCertificateBrandToIntroductor);
};
