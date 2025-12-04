"use client";

import { useState } from "react";
import type { AnimalIncomeReport, DateRange } from "../domain/animal-income.types";

// Mock data - Replace with actual API call
const mockData: AnimalIncomeReport = {
  startDate: "2023-02-03",
  endDate: "2025-12-04",
  data: [
    {
      species: "BOVINO",
      quantity: 25744,
      totalAmount: 32,
      percentage: 49.3,
    },
    {
      species: "PORCINO",
      quantity: 25452,
      totalAmount: 135.5,
      percentage: 48.8,
    },
    {
      species: "OVINO/CAPRINO",
      quantity: 993,
      totalAmount: 0,
      percentage: 1.9,
    },
  ],
  total: {
    quantity: 52189,
    amount: 167.5,
  },
  historyData: Array.from({ length: 24 }, (_, i) => {
    const date = new Date(2023, 1 + i, 1);
    return {
      date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      BOVINO: Math.floor(Math.random() * 500) + 500,
      PORCINO: Math.floor(Math.random() * 500) + 500,
      "OVINO/CAPRINO": Math.floor(Math.random() * 50) + 10,
    };
  }),
};

export function useAnimalIncomeReport() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date("2023-02-03"),
    to: new Date("2025-12-04"),
  });
  const [reportData, setReportData] = useState<AnimalIncomeReport>(mockData);
  const [isLoading, setIsLoading] = useState(false);

  const fetchReport = async (range: DateRange) => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/animal-income-report?from=${range.from}&to=${range.to}`);
      // const data = await response.json();
      // setReportData(data);
      
      // Simulating API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setReportData(mockData);
      setDateRange(range);
    } catch (error) {
      console.error("Error fetching report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    dateRange,
    reportData,
    isLoading,
    fetchReport,
  };
}
