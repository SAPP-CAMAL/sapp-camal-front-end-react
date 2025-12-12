import { http } from "@/lib/ky";
import type { GetHookTypesBySpecieResponse } from "../../domain/hook-type.types";

export async function getHookTypesBySpecieService(
  idSpecie: number
): Promise<GetHookTypesBySpecieResponse> {
  return await http
    .get(`v1/1.0.0/hook-type/by-specie/${idSpecie}`)
    .json<GetHookTypesBySpecieResponse>();
}
