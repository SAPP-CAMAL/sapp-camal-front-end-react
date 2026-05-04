import { http } from '@/lib/ky';
import { ScanBarcodeResponse, CheckBarcodeResponse } from '../../domain/scan-barcode.interface';

export async function checkBarcodeService(code: string): Promise<CheckBarcodeResponse> {
  try {
    const response = await http
      .post('v1/1.0.0/scan-barcode/check', { json: { code } })
      .json<CheckBarcodeResponse>();
    return response;
  } catch (error: any) {
    console.error('Error en checkBarcodeService:', error);
    throw error;
  }
}

export async function saveBarcodeService(code: string): Promise<ScanBarcodeResponse> {
  try {
    const response = await http
      .post('v1/1.0.0/scan-barcode/save', { json: { code } })
      .json<ScanBarcodeResponse>();
    return response;
  } catch (error: any) {
    console.error('Error en saveBarcodeService:', error);
    throw error;
  }
}

export async function saveFairTicketService(data: {
  code: string;
  productiveStageId: number;
}): Promise<any> {
  return http.post('v1/1.0.0/fair-ticket', { json: data }).json<any>();
}

export async function reclaimFairTicketByIdService(id: number): Promise<any> {
  return http.patch(`v1/1.0.0/fair-ticket/reclaim-by-id/${id}`).json<any>();
}

export async function printFairTicketPdfService(code: string): Promise<void> {
  const blob = await http
    .get(`v1/1.0.0/fair-ticket/print/${encodeURIComponent(code)}`)
    .blob();
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
