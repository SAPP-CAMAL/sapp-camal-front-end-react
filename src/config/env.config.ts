/**
 * Configuración centralizada de variables de entorno para la aplicación.
 * Permite personalizar el nombre del camal y otros parámetros globales.
 */
export const ENV = {
    // Nombre de la ciudad o del camal (ej. RIOBAMBA, IBARRA)
    CAMAL_NAME: process.env.NEXT_PUBLIC_CAMAL_NAME || "RIOBAMBA",

    // Nombre completo de la entidad para reportes y encabezados
    COMPANY_NAME: process.env.NEXT_PUBLIC_COMPANY_NAME || "EMPRESA PÚBLICA MUNICIPAL DE FAENAMIENTO",

    // Ubicación por defecto (pueden ser extendidas si es necesario)
    LOCATION: {
        PROVINCE: process.env.NEXT_PUBLIC_LOCATION_PROVINCE || "CHIMBORAZO",
        CANTON: process.env.NEXT_PUBLIC_CAMAL_NAME || "RIOBAMBA",
        PARISH: process.env.NEXT_PUBLIC_LOCATION_PARISH || "RIOBAMBA",
    }
};

/**
 * Helper para obtener el nombre completo de la empresa con la ubicación.
 */
export const getFullCompanyName = () => `${ENV.COMPANY_NAME} DEL CANTÓN ${ENV.CAMAL_NAME}`;
