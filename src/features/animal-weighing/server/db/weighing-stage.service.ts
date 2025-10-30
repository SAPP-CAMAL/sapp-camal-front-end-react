import { http } from "@/lib/ky";
import type { GetWeighingStagesResponse } from "../../domain/weighing-stage.types";

export async function getWeighingStagesService(): Promise<GetWeighingStagesResponse> {
  return await http
    .get("v1/1.0.0/weighing-stage/all-active")
    .json<GetWeighingStagesResponse>();
}
