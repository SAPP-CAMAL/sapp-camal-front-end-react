"use client";

import { ReceptionProvider } from "@/features/reception/context/reception-provider";
import { AnimalAdmissionSteps } from "@/features/reception/components/animal-admission-steps";
import { NavigationGuard } from "@/features/reception/components/navigation-guard";

export const AnimalAdmissionPage = () => {
  return (
    <ReceptionProvider>
      <NavigationGuard>
        {/* Title */}
        <div className="mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-semibold">
            Registro de Ingreso de Animales
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Complete los siguientes pasos para registrar el ingreso de animales
          </p>
        </div>

        {/* Animal admission steps */}
        <AnimalAdmissionSteps />
      </NavigationGuard>
    </ReceptionProvider>
  );
};
