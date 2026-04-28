import { http } from '@/lib/ky';
import { ScanBarcodeResponse, CheckBarcodeResponse } from '../../domain/scan-barcode.interface';

// Servicio para verificar si un código de barras ya fue escaneado
export async function checkBarcodeService(code: string): Promise<CheckBarcodeResponse> {
  try {
    const response = await http
      .post('v1/1.0.0/scan-barcode/check', {
        json: { code },
      })
      .json<CheckBarcodeResponse>();

    return response;
  } catch (error: any) {
    console.error('Error en checkBarcodeService:', error);
    throw error;
  }
}

// Servicio para guardar un código de barras escaneado
export async function saveBarcodeService(code: string): Promise<ScanBarcodeResponse> {
  try {
    const response = await http
      .post('v1/1.0.0/scan-barcode/save', {
        json: { code },
      })
      .json<ScanBarcodeResponse>();

    return response;
  } catch (error: any) {
    console.error('Error en saveBarcodeService:', error);
    throw error;
  }
}

// Servicio para enviar los datos del boleto de feria (fair-ticket)
export async function saveFairTicketService(data: { code: string; productiveStageId: number }): Promise<any> {
  try {
    const response = await http
      .post('v1/1.0.0/fair-ticket', {
        json: data,
      })
      .json<any>();

    return response;
  } catch (error: any) {
    console.error('Error en saveFairTicketService:', error);
    throw error;
  }
}
