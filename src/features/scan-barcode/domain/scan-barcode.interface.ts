// Interfaz para el resultado del escaneo
export interface ScanBarcodeResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    code: string;
    scannedAt: string;
    certificate?: any;
  };
}

// Interfaz para verificar si el código ya fue escaneado
export interface CheckBarcodeResponse {
  exists: boolean;
  message: string;
  data?: any;
}
