import { http } from "@/lib/ky";
import type { EnvironmentVariable } from "@/features/dashboard/domain/environment-variables.types";
import { CommonHttpResponseSingle } from "@/features/people/domain";

export type ResponseEnvironmentVariablesAll = CommonHttpResponseSingle<EnvironmentVariable[]>;

export type CreateEnvironmentVariableBody = {
  name: string;
  token: string;
  typeData: string;
  status?: boolean;
};

export type UpdateEnvironmentVariableBody = Partial<CreateEnvironmentVariableBody>;

export function getAllEnvironmentVariablesService(): Promise<ResponseEnvironmentVariablesAll> {
  return http.get("v1/1.0.0/environment-variables/all").json();
}

export function createEnvironmentVariableService(body: CreateEnvironmentVariableBody) {
  return http.post("v1/1.0.0/environment-variables", { json: body }).json();
}

export function updateEnvironmentVariableService(id: number, body: UpdateEnvironmentVariableBody) {
  return http.patch(`v1/1.0.0/environment-variables/${id}`, { json: body }).json();
}

export function deleteEnvironmentVariableService(id: number) {
  return http.delete(`v1/1.0.0/environment-variables/${id}`);
}
