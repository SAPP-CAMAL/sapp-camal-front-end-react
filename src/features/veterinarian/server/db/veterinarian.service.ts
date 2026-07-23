import { http } from "@/lib/ky";
import { Veterinarian } from "@/features/veterinarian/domain";
import { CommonHttpResponseSingle } from "@/features/people/domain";

export type ResponseVeterinarianAll = CommonHttpResponseSingle<Veterinarian[]>;

export function getAllVeterinariansService(): Promise<ResponseVeterinarianAll> {
  return http.get("v1/1.0.0/veterinarian/all").json();
}

export function updateVeterinarianAuthorizationService(
  id: number,
  authorizedDistribution: boolean,
) {
  return http
    .patch(`v1/1.0.0/veterinarian/${id}/authorization`, {
      json: { authorizedDistribution },
    })
    .json();
}
