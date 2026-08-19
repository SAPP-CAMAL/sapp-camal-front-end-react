import { http } from "@/lib/ky";
import { StatusCorralDailyAdmin } from "../../domain/status-corral.domain";

export async function getStatusCorralsDailyAdminService(
  idLine: number,
  admissionDate: string
): Promise<StatusCorralDailyAdmin[]> {
  return http
    .get("v1/1.0.0/status-corrals/daily-admin", {
      searchParams: {
        admissionDate,
        idLine: idLine.toString(),
      },
      next: {
        tags: ["status-corrals", "daily-admin"],
      },
    })
    .json<StatusCorralDailyAdmin[]>();
}
