import { useQuery } from "@tanstack/react-query";
import { getProvinces } from "../server/provinces.service";

export function useProvinces() {
  return useQuery({
    queryKey: ["provinces"],
    queryFn: getProvinces,
  });
}
