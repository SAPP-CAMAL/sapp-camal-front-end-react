"use client";

import dynamic from "next/dynamic";
import type { AnimalIncomeData } from "../domain/animal-income.types";

// Dynamically import the 3D chart to avoid SSR issues
const Chart3DContent = dynamic<{ data: AnimalIncomeData[] }>(
  () => import("./chart-3d-content"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[300px] sm:h-[400px] lg:h-[500px] rounded-xl overflow-hidden flex items-center justify-center bg-slate-50">
        <div className="text-center px-4">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-2 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-slate-600 text-sm sm:text-base">Cargando gráfico 3D...</p>
        </div>
      </div>
    ),
  }
);

interface Chart3DProps {
  data: AnimalIncomeData[];
}

export function Chart3D({ data }: Chart3DProps) {
  return <Chart3DContent data={data} />;
}
