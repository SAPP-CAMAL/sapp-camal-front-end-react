import { http } from "@/lib/ky";
import { FiltersFiscalization, ResponseFiscalizationByFilter } from "../domain";

export function getFiscalizationByFilterService(
  filters: FiltersFiscalization = {}
): Promise<ResponseFiscalizationByFilter> {
  return http
    .post("v1/1.0.0/setting-cert-brand/monthly-auditing-paginated", {
      json: filters,
    })
    .json<ResponseFiscalizationByFilter>();
}

export async function downloadFiscalizationExcelReport(
  date: string
): Promise<{ blob: Blob; filename: string }> {
  const response = await http.get(
    `v1/1.0.0/setting-cert-brand/monthly-summary-animal-auditing-report`,
    {
      searchParams: { date },
    }
  );

  const blob = await response.blob();
  const contentDisposition = response.headers.get("content-disposition");
  let filename = `fiscalizacion_${date}.xlsx`;

  if (contentDisposition) {
    const match = contentDisposition.match(/filename="?([^"]+)"?/);
    if (match) {
      filename = match[1];
    }
  }

  return { blob, filename };
}
