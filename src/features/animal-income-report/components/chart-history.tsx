"use client";

import { useState, useRef } from "react";
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
import { Menu, Printer, Image as ImageIcon, FileText, FileSpreadsheet, Maximize2 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";

interface ChartHistoryProps {
  data: any[];
  startDate: string;
  endDate: string;
  tableData?: any[];
}

export function ChartHistory({ data, startDate, endDate, tableData = [] }: ChartHistoryProps) {
  const [viewMode, setViewMode] = useState<"MENSUAL" | "ANUAL">("MENSUAL");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const printRef = useRef<HTMLDivElement>(null);

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

  const handleDownloadPNG = async () => {
    if (!chartRef.current) return;
    
    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        ignoreElements: (element) => {
          return element.classList.contains('no-export');
        },
      });
      
      const link = document.createElement("a");
      link.download = `reporte-ingreso-animales-${startDate}-${endDate}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Error al generar PNG:", error);
      alert("Error al generar la imagen. Por favor, intente nuevamente.");
    }
  };

  const handleDownloadPDF = async () => {
    if (!chartRef.current) return;
    
    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        ignoreElements: (element) => {
          return element.classList.contains('no-export');
        },
      });
      
      const imgData = canvas.toDataURL("image/png");
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF({
        orientation: imgHeight > imgWidth ? "portrait" : "landscape",
        unit: "mm",
        format: "a4",
      });
      
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`reporte-ingreso-animales-${startDate}-${endDate}.pdf`);
    } catch (error) {
      console.error("Error al generar PDF:", error);
      alert("Error al generar el PDF. Por favor, intente nuevamente.");
    }
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
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600 no-export self-end sm:self-auto order-1 sm:order-3">
                  <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={handlePrint} className="cursor-pointer text-sm">
                  <Printer className="mr-2 h-4 w-4" />
                  <span>Imprimir</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadPNG} className="cursor-pointer text-sm">
                  <ImageIcon className="mr-2 h-4 w-4" />
                  <span>Descargar en Imagen PNG</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadPDF} className="cursor-pointer text-sm">
                  <FileText className="mr-2 h-4 w-4" />
                  <span>Descargar en PDF</span>
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
                wrapperStyle={{ fontSize: "11px" }}
              />
              <Bar dataKey="BOVINO" fill="#0f766e" name="BOVINO" radius={[2, 2, 0, 0]} barSize={6} />
              <Bar dataKey="PORCINO" fill="#14b8a6" name="PORCINO" radius={[2, 2, 0, 0]} barSize={6} />
              <Bar dataKey="OVINO/CAPRINO" fill="#f59e0b" name="OVINO/CAPRINO" radius={[2, 2, 0, 0]} barSize={6} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
    </>
  );
}
