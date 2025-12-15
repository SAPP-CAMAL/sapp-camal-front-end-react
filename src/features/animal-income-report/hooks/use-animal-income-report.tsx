"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import type { AnimalIncomeReport, DateRange } from "../domain/animal-income.types";
import {
  getManagerReportTotals,
  processReportData,
} from "../server/db/animal-income-report.service";

const emptyReport: AnimalIncomeReport = {
  startDate: "",
  endDate: "",
  data: [],
  total: {
    quantity: 0,
    amount: 0,
  },
  historyData: [],
};

export function useAnimalIncomeReport() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date("2023-02-03"),
    to: new Date(),
  });
  const [reportData, setReportData] = useState<AnimalIncomeReport>(emptyReport);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReport = async (range: DateRange) => {
    if (!range.from || !range.to) return;

    setIsLoading(true);
    try {
      const startDate = format(range.from, "yyyy-MM-dd");
      const endDate = format(range.to, "yyyy-MM-dd");

      const response = await getManagerReportTotals(startDate, endDate);

      if (response.code === 200) {
        const processed = processReportData(response, startDate, endDate);

        // Adaptar al formato esperado por el componente
        setReportData({
          startDate: processed.startDate,
          endDate: processed.endDate,
          data: processed.data.map((item) => ({
            ...item,
            totalAmount: 0, // Ya no usamos precios
          })),
          total: {
            quantity: processed.total.quantity,
            amount: 0, // Ya no usamos precios
          },
          historyData: processed.historyData,
        });
      }

      setDateRange(range);
    } catch (error) {
      console.error("Error fetching report:", error);
      setReportData(emptyReport);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    fetchReport(dateRange);
  }, []);

  return {
    dateRange,
    reportData,
    isLoading,
    fetchReport,
  };
}
