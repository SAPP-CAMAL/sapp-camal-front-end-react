/**
 * Información del camal obtenida desde el backend
 */
export interface SlaughterhouseInfo {
  camalName: string;
  companyName: string;
  location: {
    province: string;
    canton: string;
    parish: string;
  };
  gadUrl?: string;
}

/**
 * Respuesta del API para la información del camal (formato backend)
 */
export interface SlaughterhouseInfoApiResponse {
  code: number;
  message: string;
  data: {
    reportProvince: string;
    nameCamal: string;
    reportCanton: string;
    reportParroquia: string;
    gadUrl?: string;
    companyName: string;
  };
}
