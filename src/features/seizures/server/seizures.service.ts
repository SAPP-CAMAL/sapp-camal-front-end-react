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
        endDate: today,
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
