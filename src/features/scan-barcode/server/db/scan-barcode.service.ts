import { http } from "@/lib/ky";
import { CreateOrUpdateHttpResponse } from "@/features/people/domain";
import { CreateFairTicketBody, FairTicket } from "../../domain";

export function saveFairTicketService(
  body: CreateFairTicketBody
): Promise<CreateOrUpdateHttpResponse<FairTicket>> {
  return http
    .post("v1/1.0.0/fair-ticket", { json: body })
    .json<CreateOrUpdateHttpResponse<FairTicket>>();
}

export function reclaimFairTicketByCodeService(
  code: string
): Promise<CreateOrUpdateHttpResponse<FairTicket>> {
  return http
    .patch(`v1/1.0.0/fair-ticket/reclaim/${encodeURIComponent(code)}`)
    .json<CreateOrUpdateHttpResponse<FairTicket>>();
}

export async function printFairTicketPdfService(code: string): Promise<void> {
  const blob = await http
    .get(`v1/1.0.0/fair-ticket/print/${encodeURIComponent(code)}`)
    .blob();
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
