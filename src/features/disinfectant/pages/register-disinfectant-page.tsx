"use client";

import { DisinfectantProvider } from "../context/disinfectant-provider";
import {
  DailyDisinfectionLogTable,
  RegisterDisinfectantDataForm,
  RegisterDisinfectantPageHeader,
} from "@/features/disinfectant/components";

export const RegisterDisinfectantPage = () => {
  return (
    <DisinfectantProvider>
      {/* Title and scanner qr button */}
      <RegisterDisinfectantPageHeader />

      <section className="overflow-hidden rounded-lg border p-2 sm:p-4 bg-white">
        {/* Form */}
        <RegisterDisinfectantDataForm />

        {/* Separator */}
        <hr className="my-3 sm:my-4" />

        {/* Daily records table */}
        <DailyDisinfectionLogTable />
      </section>
    </DisinfectantProvider>
  );
};
