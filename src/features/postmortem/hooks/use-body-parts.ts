"use client";

import { useQuery } from "@tanstack/react-query";
import { getBodyPartsService } from "../server/db/body-parts.service";

export function useBodyParts() {
    return useQuery({
        queryKey: ["body-parts"],
        queryFn: () => getBodyPartsService(),
        staleTime: 1000 * 60 * 30, 
    });
}
