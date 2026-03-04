import { http } from "@/lib/ky";

export interface CleaningDisinfectionDetail {
  id?: number;
  idAreaStructure: number;
  inspectionDate: string;
  ldClean: boolean;
  lpClean: boolean;
  vqBroken: boolean;
  pqBroken: boolean;
  luminoUrl: number | null;
  vpNa: boolean;
}

export interface SaveCleaningDisinfectionRequest {
  idLine: number;
  idCode: number;
  date: string;
  startTime: string;
  endTime: string;
  observation?: string;
  correctiveAction?: string;
  idResponsible: number;
  status: boolean;
  details: CleaningDisinfectionDetail[];
}

export interface SaveCleaningDisinfectionResponse {
  code: number;
  message: string;
  data: any;
}

export async function saveCleaningDisinfectionRecordService(
  data: SaveCleaningDisinfectionRequest
): Promise<SaveCleaningDisinfectionResponse | null> {
  try {
    const response = await http
      .post("v1/1.0.0/cleaning-disinfection-record/bulk", {
        json: data,
      })
      .json<SaveCleaningDisinfectionResponse>();

    return response;
  } catch (error: any) {
    throw error;
  }
}

export async function updateCleaningDisinfectionRecordService(
  id: number,
  data: SaveCleaningDisinfectionRequest
): Promise<SaveCleaningDisinfectionResponse | null> {
  try {
    const response = await http
      .patch(`v1/1.0.0/cleaning-disinfection-record/bulk/${id}`, {
        json: data,
      })
      .json<SaveCleaningDisinfectionResponse>();

    return response;
  } catch (error: any) {
    throw error;
  }
}

export async function generateCleaningDisinfectionReportService(
  idLine: number,
  date: string
): Promise<Blob> {
  try {
    const response = await http
      .post("v1/1.0.0/cleaning-disinfection-record/report", {
        json: { idLine, date },
        headers: {
          accept: "application/pdf",
        },
      })
      .blob();

    return response;
  } catch (error: any) {
    throw error;
  }
}
