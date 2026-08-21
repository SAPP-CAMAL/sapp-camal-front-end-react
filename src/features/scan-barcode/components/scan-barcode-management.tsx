"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarcodeIcon, ShieldCheck } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAllProductiveStages } from "@/features/productive-stage/server/db/productive-stage.service";
import { useAllSpecies } from "@/features/specie/hooks";

import { RegisterFairTicket } from "./register-fair-ticket";
import { VerifyFairTicket } from "./verify-fair-ticket";
import { FAIR_PRODUCTIVE_STAGES_TAG } from "../constants";

type FairTab = "register" | "verify";

export function ScanBarcodeManagement() {
  const [tab, setTab] = useState<FairTab>("register");

  const stagesQuery = useQuery({
    queryKey: [FAIR_PRODUCTIVE_STAGES_TAG],
    queryFn: async () => {
      const response = await getAllProductiveStages();
      return response?.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const speciesQuery = useAllSpecies();

  return (
    <div className="space-y-5">
      <section className="space-y-1">
        <h1 className="text-lg font-semibold sm:text-xl">
          Registro de Ingreso de Feria
        </h1>
        <p className="text-sm text-muted-foreground">
          Plaza de Comercialización de Ganado en Pie del Cantón Riobamba
        </p>
      </section>

      <Tabs value={tab} onValueChange={(value) => setTab(value as FairTab)}>
        <TabsList className="grid h-auto w-full grid-cols-2 sm:w-auto sm:inline-grid">
          <TabsTrigger value="register" className="h-11 gap-2 px-6 text-sm">
            <BarcodeIcon className="h-4 w-4" />
            Registrar
          </TabsTrigger>
          <TabsTrigger value="verify" className="h-11 gap-2 px-6 text-sm">
            <ShieldCheck className="h-4 w-4" />
            Verificar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="register" className="mt-5">
          <RegisterFairTicket
            stages={stagesQuery.data ?? []}
            species={speciesQuery.data?.data ?? []}
            isLoadingStages={stagesQuery.isLoading}
            isActiveTab={tab === "register"}
          />
        </TabsContent>

        <TabsContent value="verify" className="mt-5">
          <VerifyFairTicket isActiveTab={tab === "verify"} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ScanBarcodeManagement;
