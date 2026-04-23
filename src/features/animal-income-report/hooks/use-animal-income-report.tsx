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

const normalizeRangeToDayBounds = (range: DateRange): DateRange => {
  if (!range.from || !range.to) return range;

  const from = new Date(range.from);
  from.setHours(0, 0, 0, 0);

  const to = new Date(range.to);
  to.setHours(23, 59, 59, 999);

  return { from, to };
};

const getDefaultDateRange = (): DateRange => {
  const today = new Date();
  const from = new Date(today);
  from.setDate(today.getDate() - 6);
  return normalizeRangeToDayBounds({ from, to: today });
};

export function useAnimalIncomeReport() {
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange);
  const [reportData, setReportData] = useState<AnimalIncomeReport>(emptyReport);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReport = async (range: DateRange) => {
    const normalizedRange = normalizeRangeToDayBounds(range);
    if (!normalizedRange.from || !normalizedRange.to) return;

    setIsLoading(true);
    try {
      const startDate = format(normalizedRange.from, "yyyy-MM-dd");
      const endDate = format(normalizedRange.to, "yyyy-MM-dd");

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

      setDateRange(normalizedRange);
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
