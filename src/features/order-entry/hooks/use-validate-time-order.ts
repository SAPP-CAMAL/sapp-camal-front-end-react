import { useQuery } from "@tanstack/react-query";
import { http } from "@/lib/ky";
import { HTTPError } from "ky";

interface ValidateTimeOrderResponse {
  code: number;
  message: string;
  data: string;
}

export function useValidateTimeOrder() {
  return useQuery({
    queryKey: ["validate-time-order"],
    queryFn: async () => {
      try {
        const response = await http.get("v1/1.0.0/orders/validate-time-order").json<ValidateTimeOrderResponse>();
        
        // Si el código no es 200, lanzar error con solo el mensaje del data
        if (response.code !== 200) {
          throw new Error(response.data || response.message);
        }
        
        return response;
      } catch (error) {
        // Si es un HTTPError (400, 401, etc), extraer el mensaje del body
        if (error instanceof HTTPError) {
          const errorBody = await error.response.json<ValidateTimeOrderResponse>();
          throw new Error(errorBody.data || errorBody.message || "Error al validar horario");
        }
        throw error;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
  });
}
