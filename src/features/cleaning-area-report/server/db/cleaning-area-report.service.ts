import { http } from "@/lib/ky";
import type { CleaningAreaReportResponse } from "../../domain";

export interface GetCleaningAreaReportParams {
  startDate: string; // yyyy-MM-dd
  endDate: string;   // yyyy-MM-dd
  lineId?: number;
}

export interface CleaningDisinfectionRecordDetail {
  id: number;
  idRecord: number;
  idAreaStructure: number;
  inspectionDate: string;
  ldClean: boolean;
  lpClean: boolean;
  vqBroken: boolean;
  pqBroken: boolean;
  luminoUrl: string | null;
  vpNa: boolean;
  status: boolean;
}

export interface CleaningDisinfectionRecordResponse {
  code: number;
  message: string;
  data: {
    id: number;
    idLine: number;
    idCode: number;
    date: string;
    startTime: string;
    endTime: string;
    observation: string;
    correctiveAction: string;
    idResponsible: number;
    status: boolean;
    details: CleaningDisinfectionRecordDetail[];
  } | null;
}

export const getCleaningAreaReportService = async (
  params: GetCleaningAreaReportParams
): Promise<CleaningAreaReportResponse | null> => {
  try {
    const searchParams: Record<string, string> = {
      startDate: params.startDate,
      endDate: params.endDate,
    };

    if (params.lineId) {
      searchParams.lineId = params.lineId.toString();
    }

    const response = await http
      .get("v1/1.0.0/cleaning-area-control/by-date", {
        searchParams,
      })
      .json<CleaningAreaReportResponse>();

    return response;
  } catch {
    return null;
  }
};

export const getCleaningDisinfectionRecordByLineDateService = async (
  lineId: number,
  date: string
): Promise<CleaningDisinfectionRecordResponse | null> => {
  try {
    const searchParams = {
      idLine: lineId.toString(),
      date: date,
    };

    const response = await http
      .get("v1/1.0.0/cleaning-disinfection-record/by-line-date", {
        searchParams,
      })
      .json<CleaningDisinfectionRecordResponse>();

    return response;
  } catch (error) {
    console.log("No se encontró registro para esta fecha");
    return null;
  }
};
