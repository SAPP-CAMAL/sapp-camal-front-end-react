import { ssrGetJson } from "@/lib/ky-ssr";
import type { EnvironmentVariableResponse } from "../../domain/environment-variables.types";

/**
 * Obtener variable de entorno por nombre
 */
export async function getEnvironmentVariableByName(
  name: string
): Promise<EnvironmentVariableResponse> {
  return await ssrGetJson<EnvironmentVariableResponse>(
    `v1/1.0.0/environment-variables/by-name?name=${name}`
  );
}
