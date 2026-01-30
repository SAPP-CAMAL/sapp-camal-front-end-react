import { http } from "@/lib/ky";
import {
  FiltersSeizures,
  ResponseAnimalSeizures,
} from "../domain";

export function getAnimalSeizuresService(
  filters: FiltersSeizures
): Promise<ResponseAnimalSeizures> {
  const today = new Date().toISOString().split("T")[0];

  return http
    .post("v1/1.0.0/detail-specie-cert/animal-confiscation-data", {
      json: {
        page: filters.page || 1,
        limit: filters.limit || 10,
        idSpecie: filters.idSpecie,
        startDate: filters.startDate || today,
        endDate: filters.endDate || today,
      },
    })
    .json<ResponseAnimalSeizures>();
}

export async function getAnimalConfiscationReportService(
  animalId: number
): Promise<{ blob: Blob; filename: string }> {
  const response = await http.get(
    `v1/1.0.0/detail-specie-cert/animal-confiscation-report-by-id/${animalId}`
  );

  const blob = await response.blob();
  const filename = `reporte_decomiso_animal_${animalId}.pdf`;

  return { blob, filename };
}

export async function downloadAnimalSeizuresReport(
  filters: FiltersSeizures & { typeReport: 'EXCEL' | 'PDF' }
): Promise<void> {
  const response = await http.post(
    `v1/1.0.0/detail-specie-cert/animal-confiscation-report?typeReport=${filters.typeReport}`,
    {
      json: {
        // page: filters.page || 1,
        // limit: filters.limit || 10,
        startDate: filters.startDate,
        endDate: filters.endDate,
        idSpecie: filters.idSpecie,
      },
    }
  );

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;

  const extension = filters.typeReport === 'EXCEL' ? 'xlsx' : 'pdf';
  a.download = `reporte_decomisos_${filters.startDate}_${filters.endDate}.${extension}`;

  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
