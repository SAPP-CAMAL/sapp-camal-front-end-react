"use client";

import React, { useState, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, Printer, FileSpreadsheet, Maximize2 } from "lucide-react";
import * as XLSX from "xlsx";

import { AnimalIncomeData } from "../domain/animal-income.types";

export interface ChartHistoryProps {
  data: any[];
  startDate: string;
  endDate: string;
  tableData?: AnimalIncomeData[];
}

export const ChartHistory: React.FC<ChartHistoryProps> = ({ data, startDate, endDate, tableData = [] }) => {
  const [viewMode, setViewMode] = useState<"MENSUAL" | "ANUAL">("MENSUAL");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [visibleBars, setVisibleBars] = useState<Record<string, boolean>>({
    BOVINO: true,
    PORCINO: true,
    "OVINO/CAPRINO": true,
  });
  const chartRef = useRef<HTMLDivElement>(null);
  const printRef = useRef<HTMLDivElement>(null);

  // Toggle visibility of a bar
  const handleLegendClick = (dataKey: string) => {
    setVisibleBars((prev) => ({
      ...prev,
      [dataKey]: !prev[dataKey],
    }));
  };

  // Process data for ANUAL view if needed
  const chartData = viewMode === "ANUAL" 
    ? Object.values(data.reduce((acc: any, curr) => {
        const year = curr.date.split("-")[0];
        if (!acc[year]) {
          acc[year] = { date: year, BOVINO: 0, PORCINO: 0, "OVINO/CAPRINO": 0 };
        }
        acc[year].BOVINO += curr.BOVINO;
        acc[year].PORCINO += curr.PORCINO;
        acc[year]["OVINO/CAPRINO"] += curr["OVINO/CAPRINO"];
        return acc;
      }, {}))
    : data;

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Reporte de Ingresos de Animales</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 20px;
              color: #1e293b;
            }
            h1 { 
              text-align: center; 
              color: #0f766e;
              margin-bottom: 10px;
            }
            h2 {
              text-align: center;
              color: #64748b;
              font-size: 14px;
              font-weight: normal;
              margin-bottom: 30px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px;
            }
            th, td { 
              border: 1px solid #e2e8f0; 
              padding: 12px; 
              text-align: left; 
            }
            th { 
              background-color: #f1f5f9; 
              font-weight: 600;
              color: #475569;
            }
            tr:nth-child(even) { 
              background-color: #f8fafc; 
            }
            .total-row {
              background-color: #f1f5f9 !important;
              font-weight: bold;
            }
            .chart-container {
              margin: 30px 0;
              page-break-inside: avoid;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleDownloadXLS = () => {
    const worksheet = XLSX.utils.json_to_sheet(chartData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte");
    XLSX.writeFile(workbook, `reporte-ingreso-animales-${startDate}-${endDate}.xlsx`);
  };

  const handleFullScreen = () => {
    if (!chartRef.current) return;
    
    if (!document.fullscreenElement) {
      chartRef.current.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-EC", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("es-EC").format(value);
  };

  return (
    <>
      <div ref={printRef} style={{ display: 'none' }}>
        <h1>EMPRESA PÚBLICA MUNICIPAL DE FAENAMIENTO DEL CANTÓN RIOBAMBA</h1>
        <h2>Gráfico estadístico de las fechas comprendidas entre {startDate} y {endDate} ({viewMode})</h2>
        
        <div className="chart-container">
          <img src={chartRef.current?.querySelector('canvas')?.toDataURL()} alt="Gráfico" style={{ width: '100%', maxWidth: '800px', margin: '0 auto', display: 'block' }} />
        </div>

        {tableData.length > 0 && (
          <>
            <h3 style={{ marginTop: '40px', color: '#0f766e' }}>Tabla de Datos</h3>
            <table>
              <thead>
                <tr>
                  <th>Especies</th>
                  <th style={{ textAlign: 'right' }}>Cantidad de animales</th>
                  <th style={{ textAlign: 'right' }}>$ Total recaudado</th>
                  <th style={{ textAlign: 'right' }}>Porcentaje</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((item: any) => (
                  <tr key={item.species}>
                    <td>{item.species}</td>
                    <td style={{ textAlign: 'right' }}>{formatNumber(item.quantity)}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(item.totalAmount)}</td>
                    <td style={{ textAlign: 'right' }}>{item.percentage.toFixed(1)}%</td>
                  </tr>
                ))}
                <tr className="total-row">
                  <td>Total</td>
                  <td style={{ textAlign: 'right' }}>
                    {formatNumber(tableData.reduce((sum: number, item: any) => sum + item.quantity, 0))}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {formatCurrency(tableData.reduce((sum: number, item: any) => sum + item.totalAmount, 0))}
                  </td>
                  <td style={{ textAlign: 'right' }}>100%</td>
                </tr>
              </tbody>
            </table>
          </>
        )}
      </div>

      <Card ref={chartRef} className="bg-white border-slate-200 shadow-sm mt-4 md:mt-6">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 order-2 sm:order-1">
              <Button
                variant={viewMode === "MENSUAL" ? "default" : "ghost"}
                onClick={() => setViewMode("MENSUAL")}
                className={`text-xs sm:text-sm px-3 sm:px-4 py-2 ${viewMode === "MENSUAL" ? "bg-teal-600 hover:bg-teal-700 text-white" : "text-slate-600"}`}
              >
                MENSUAL
              </Button>
              <Button
                variant={viewMode === "ANUAL" ? "default" : "ghost"}
                onClick={() => setViewMode("ANUAL")}
                className={`text-xs sm:text-sm px-3 sm:px-4 py-2 ${viewMode === "ANUAL" ? "bg-teal-600 hover:bg-teal-700 text-white" : "text-slate-600"}`}
              >
                ANUAL
              </Button>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:text-slate-900 no-export">
                  <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={handlePrint} className="cursor-pointer text-sm">
                  <Printer className="mr-2 h-4 w-4" />
                  <span>Imprimir</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadXLS} className="cursor-pointer text-sm">
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  <span>Descargar en XLS</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleFullScreen} className="cursor-pointer text-sm">
                  <Maximize2 className="mr-2 h-4 w-4" />
                  <span>Ver en pantalla completa</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="text-center order-3">
            <CardTitle className="text-slate-800 text-sm sm:text-base lg:text-lg font-medium uppercase">
              EMPRESA PÚBLICA MUNICIPAL DE FAENAMIENTO DEL CANTÓN RIOBAMBA
            </CardTitle>
            <CardDescription className="text-slate-500 mt-1 text-xs sm:text-sm">
              Gráfico estadístico de las fechas comprendidas entre {startDate} y {endDate} ({viewMode})
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        <div className="h-[300px] sm:h-[350px] lg:h-[400px] min-h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%" debounce={1}>
            <BarChart
              data={chartData}
              margin={{
                top: 10,
                right: 10,
                left: 0,
                bottom: 5,
              }}
              barGap={0}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="date" 
                stroke="#64748b" 
                fontSize={10}
                tickMargin={8}
                angle={-45}
                textAnchor="end"
                height={50}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={10}
                width={40}
                label={{ value: 'Total', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#64748b', fontSize: 10 } }} 
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  fontSize: "12px",
                }}
                itemStyle={{ color: "#1e293b", fontSize: "12px" }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: "11px", cursor: "pointer" }}
                onClick={(e) => handleLegendClick(e.dataKey as string)}
                formatter={(value, entry) => (
                  <span style={{ 
                    color: visibleBars[value as string] ? "#1e293b" : "#94a3b8",
                    textDecoration: visibleBars[value as string] ? "none" : "line-through"
                  }}>
                    {value}
                  </span>
                )}
              />
              <Bar 
                dataKey="BOVINO" 
                fill="#0f766e" 
                name="BOVINO" 
                radius={[2, 2, 0, 0]} 
                barSize={6}
                hide={!visibleBars.BOVINO}
              />
              <Bar 
                dataKey="PORCINO" 
                fill="#14b8a6" 
                name="PORCINO" 
                radius={[2, 2, 0, 0]} 
                barSize={6}
                hide={!visibleBars.PORCINO}
              />
              <Bar 
                dataKey="OVINO/CAPRINO" 
                fill="#f59e0b" 
                name="OVINO/CAPRINO" 
                radius={[2, 2, 0, 0]} 
                barSize={6}
                hide={!visibleBars["OVINO/CAPRINO"]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
    </>
  );
}
