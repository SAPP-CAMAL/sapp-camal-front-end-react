import { http } from "@/lib/ky";
import {
  FiltersSeizures,
  ResponseProductSeizures,
  ResponseSubproductSeizures,
} from "../domain";

export function getProductSeizuresService(
  filters: FiltersSeizures
): Promise<ResponseProductSeizures> {
  return http
    .post("v1/1.0.0/product-postmortem/by-filters", {
      json: {
        specieId: filters.specieId,
        page: filters.page,
        limit: filters.limit,
        ...(filters.createdAt && { createdAt: filters.createdAt }),
      },
    })
    .json<ResponseProductSeizures>();
}

export function getSubproductSeizuresService(
  filters: FiltersSeizures
): Promise<ResponseSubproductSeizures> {
  return http
    .post("v1/1.0.0/subproduct-postmortem/by-filters", {
      json: {
        idSpecie: filters.specieId,
        page: filters.page,
        limit: filters.limit,
        ...(filters.createdAt && { createdAt: filters.createdAt }),
      },
    })
    .json<ResponseSubproductSeizures>();
}

export async function downloadSubproductTicket(
  subProductPostmortemId: number
): Promise<{ blob: Blob; filename: string }> {
  const response = await http.get(
    `v1/1.0.0/subproduct-postmortem/ticket-report/${subProductPostmortemId}`
  );

  const blob = await response.blob();
  const filename = `ticket_subproducto_${subProductPostmortemId}.pdf`;

  return { blob, filename };
}

export async function downloadProductTicket(
  productId: number
): Promise<{ blob: Blob; filename: string }> {
  const response = await http.get(
    `v1/1.0.0/product-postmortem/ticket-report/${productId}`
  );

  const blob = await response.blob();
  const filename = `ticket_producto_${productId}.pdf`;

  return { blob, filename };
}
