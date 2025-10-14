"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Calendar, CalendarIcon, ChevronDown, Coins, Eye, FileText, Hash, Info, User, Users, Save, Loader2, X, GripVertical, Venus, Mars, BringToFront } from "lucide-react";
import { Input } from "@/components/ui/input";
import { QuantitySelector } from "@/components/quantity-selector";
import { format } from "date-fns";
import { AntemortemRow, Linea, computeTotals } from "../domain";
import { es } from "date-fns/locale";
import SignosClinicosModal from "./signos-clinicos-modal";
import { ObservacionesModal } from "./observaciones-modal";
import { AntemortemMobileCard } from "./antemortem-mobile-card";
import { getActiveLinesDataService, getAntemortemDataService, updateArgollasService } from "../server/db/antemortem.service";
import { LineItem, mapLineItemToLineaType, getLineIdByType } from "../domain/line.types";

function SelectLinea({ 
  value, 
  onChange, 
  availableLines = [],
  isLoading = false 
}: { 
  value: Linea; 
  onChange: (v: Linea) => void;
  availableLines?: LineItem[];
  isLoading?: boolean;
}) {
  const [open, setOpen] = useState(false);
  
  // Mapear las líneas de la API a los valores de Linea usando description
  const opciones: Linea[] = availableLines.length > 0 
    ? availableLines.map(mapLineItemToLineaType)
    : ["Bovinos", "Porcinos", "Ovinos Caprinos"];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="justify-between w-full bg-muted/40"
          disabled={isLoading}
        >
          <span>{isLoading ? "Cargando líneas..." : value}</span>
          <ChevronDown className="h-4 w-4 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[220px]" align="start">
        <div className="py-2">
          {isLoading ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              Cargando líneas...
            </div>
          ) : (
            opciones.map((op) => (
              <button
                key={op}
                className={`w-full text-left px-3 py-2 hover:bg-accent ${op === value ? "font-medium" : ""}`}
                onClick={() => {
                  onChange(op);
                  setOpen(false);
                }}
              >
                {op}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function AntemortemManagement() {
  // Crear fecha de hoy de manera local para evitar problemas de zona horaria
  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);
  
  const [fecha, setFecha] = useState<Date>(today);
  const [linea, setLinea] = useState<Linea>("Bovinos");
  const [signosOpen, setSignosOpen] = useState(false);
  const [signosSettingId, setSignosSettingId] = useState<number>(0);
  const [signosMarca, setSignosMarca] = useState<string>("");
  const [signosIdSpecie, setSignosIdSpecie] = useState<number>(1); // Default: Bovinos = 1
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Estados para editar argollas
  const [editingArgollasCorral, setEditingArgollasCorral] = useState<string | null>(null);
  const [tempArgollasValue, setTempArgollasValue] = useState<number>(0);
  const [savingArgollasCorral, setSavingArgollasCorral] = useState<string | null>(null);

  // Estados para resumen flotante y draggable
  const [showFloatingTotals, setShowFloatingTotals] = useState(true);
  const [floatingPosition, setFloatingPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; elemX: number; elemY: number } | null>(null);

  // Inicializar posición flotante en el cliente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setFloatingPosition({ 
        x: 20, // Esquina inferior izquierda
        y: window.innerHeight - 150
      });
    }
  }, []);

  // Manejar eventos de mouse globalmente para el drag
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && dragRef.current) {
        const deltaX = e.clientX - dragRef.current.startX;
        const deltaY = e.clientY - dragRef.current.startY;
        setFloatingPosition({
          x: dragRef.current.elemX + deltaX,
          y: dragRef.current.elemY + deltaY
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Estados para cargar líneas desde la nueva API
  const [availableLines, setAvailableLines] = useState<LineItem[]>([]);
  const [isLoadingLines, setIsLoadingLines] = useState(false);
  
  // Estados para datos de antemortem
  const [antemortemData, setAntemortemData] = useState<AntemortemRow[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Renderizado de marcas: colorea H (azul) y M (rosa) mostrando numero primero, robusto ante "6H", "H:6", comas y corchetes
  const renderMarcaPieces = (m: string) => {
    const nodes: React.ReactNode[] = [];
    const re = /(H\s*[:=]\s*(\d+))|(\b(\d+)\s*H\b)|(M\s*[:=]\s*(\d+))|(\b(\d+)\s*M\b)/gi;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = re.exec(m)) !== null) {
      const start = match.index;
      if (start > lastIndex) {
        nodes.push(
          <span key={`t-${lastIndex}`} className="text-black">
            {m.slice(lastIndex, start)}
          </span>
        );
      }
      let isH = false;
      let num = "";
      if (match[1]) {
        isH = true;
        num = match[2] ?? "";
      } else if (match[3]) {
        isH = true;
        num = match[4] ?? "";
      } else if (match[5]) {
        isH = false;
        num = match[6] ?? "";
      } else if (match[7]) {
        isH = false;
        num = match[8] ?? "";
      }
      nodes.push(
        <span key={`k-${start}`} className={isH ? "text-rose-600" : "text-blue-600"}>
          {num} {isH ? "H" : "M"}
        </span>
      );
      lastIndex = re.lastIndex;
    }
    if (lastIndex < m.length) {
      nodes.push(
        <span key={`t-${lastIndex}`} className="text-black">
          {m.slice(lastIndex)}
        </span>
      );
    }
    return nodes;
  };

  const extractHMCounts = (m: string) => {
    // Detecta formatos: "6H", "H:6", "H = 6", etc.
    // H = Hembras, M = Machos
    const hMatch = m.match(/H\s*[:=]\s*(\d+)|(\d+)\s*H/i);
    const mMatch = m.match(/M\s*[:=]\s*(\d+)|(\d+)\s*M/i);
    const h = hMatch ? parseInt(hMatch[1] || hMatch[2]) : 0; // Hembras
    const mm = mMatch ? parseInt(mMatch[1] || mMatch[2]) : 0; // Machos
    return { h, m: mm };
  };

  // Función para cargar todas las líneas disponibles
  const loadAvailableLines = async () => {
    try {
      setIsLoadingLines(true);
      const response = await getActiveLinesDataService();
      setAvailableLines(response);
      
      // Establecer la primera línea como línea activa (siempre línea 1)
      if (response.length > 0) {
        const firstLine = mapLineItemToLineaType(response[0]);
        setLinea(firstLine);
      }
    } catch (error) {
      console.error('Error cargando líneas disponibles:', error);
      setAvailableLines([]);
    } finally {
      setIsLoadingLines(false);
    }
  };

  // Función para cargar datos de antemortem
  const loadAntemortemData = async (selectedFecha: Date, selectedLinea: Linea) => {
    try {
      setIsLoadingData(true);
      const admissionDate = format(selectedFecha, "yyyy-MM-dd");
      const lineId = getLineIdByType(selectedLinea);
      
      if (lineId === 0) {
        console.warn(`No se encontró ID para la línea: ${selectedLinea}`);
        setAntemortemData([]);
        return;
      }
      
      const data = await getAntemortemDataService(admissionDate, lineId);
      setAntemortemData(data);
    } catch (error) {
      console.error('Error cargando datos de antemortem:', error);
      setAntemortemData([]);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Efecto para cargar líneas disponibles al montar el componente
  useEffect(() => {
    loadAvailableLines();
  }, []);

  // Efecto para cargar datos cuando cambien fecha o línea
  useEffect(() => {
    if (availableLines.length > 0) {
      loadAntemortemData(fecha, linea);
    }
  }, [fecha, linea, availableLines]);

  // Efecto para actualizar idSpecie cuando cambie la línea
  useEffect(() => {
    if (availableLines.length > 0) {
      const currentLine = availableLines.find(line => mapLineItemToLineaType(line) === linea);
      if (currentLine) {
        setSignosIdSpecie(currentLine.idSpecie);
      }
    }
  }, [linea, availableLines]);

  const data = useMemo(() => {
    return {
      fecha: fecha,
      linea: linea,
      filas: antemortemData
    };
  }, [fecha, linea, antemortemData]);

  const totals = useMemo(() => computeTotals(data.filas), [data.filas]);

  // Ocultar cards de totales cuando se hace scroll (IntersectionObserver)
  const totalsRef = useRef<HTMLDivElement | null>(null);
  const [totalsHidden, setTotalsHidden] = useState(false);
  useEffect(() => {
    const el = totalsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => setTotalsHidden(!entries[0].isIntersecting),
      { root: null, threshold: 0.01 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const showArgollas = linea === "Bovinos";
  
  // Funciones para editar argollas
  const handleArgollasClick = (corral: string, currentValue: number) => {
    setEditingArgollasCorral(corral);
    setTempArgollasValue(currentValue || 0);
  };
  
  const handleSaveArgollas = async (row: AntemortemRow) => {
    if (!row.statusCorralId) {
      return;
    }

    try {
      setSavingArgollasCorral(row.corral);
      
      const response = await updateArgollasService(row.statusCorralId, tempArgollasValue);
      
      if (response.code === 200) {
        // Actualizar los datos localmente
        setAntemortemData(prevData => 
          prevData.map(item => 
            item.corral === row.corral 
              ? { ...item, argollas: tempArgollasValue }
              : item
          )
        );
        
        // Limpiar estado de edición
        setEditingArgollasCorral(null);
        setTempArgollasValue(0);
      }
    } catch (error) {
      // Error silencioso
    } finally {
      setSavingArgollasCorral(null);
    }
  };
  
  const handleCancelArgollas = () => {
    setEditingArgollasCorral(null);
    setTempArgollasValue(0);
  };

  return (
    <div className="space-y-4">
      {/* Encabezado fijo (título + filtros) */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="mx-auto max-w-screen-xl px-3 md:px-4 py-3 md:py-4">
          {/* Título */}
          <div className="text-center">
            <h1 className="text-2xl font-normal">ANTEMORTEM INTERNO- {linea.toUpperCase()}</h1>
            <p className="text-sm text-muted-foreground">Marcas generadas para: {format(fecha, "dd 'de' MMMM 'de' yyyy", { locale: es })}</p>
          </div>
          {/* Filtros */}
          <div className="mt-3 flex flex-col lg:grid lg:grid-cols-3 gap-3 lg:gap-4 lg:items-center">
            {/* Fecha */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <Label htmlFor="fecha-antemortem" className="text-sm font-medium whitespace-nowrap">
                Fecha:
              </Label>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-[200px]">
                  <CalendarIcon 
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 cursor-pointer" 
                    onClick={() => {
                      const input = document.getElementById('fecha-antemortem') as HTMLInputElement;
                      if (input) input.showPicker();
                    }}
                  />
                  <Input
                    id="fecha-antemortem"
                    type="date"
                    className="w-full bg-muted transition-colors focus:bg-background pl-8 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    value={fecha ? format(fecha, "yyyy-MM-dd") : ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const dateValue = e.target.value;
                      if (dateValue) {
                        // Crear fecha local para evitar problemas de zona horaria
                        const [year, month, day] = dateValue.split('-').map(Number);
                        const newDate = new Date(year, month - 1, day); // month es 0-indexed
                        setFecha(newDate);
                      }
                    }}
                    title="Selecciona la fecha"
                  />
                </div>
                {/* Botón para volver a hoy */}
                {format(fecha, "yyyy-MM-dd") !== format(today, "yyyy-MM-dd") && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFecha(today)}
                    className="text-xs px-2 py-1 h-8 whitespace-nowrap"
                    title="Volver a hoy"
                  >
                    Hoy
                  </Button>
                )}
              </div>
            </div>
            {/* Línea */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 lg:ml-2">
              <span className="text-sm text-black font-semibold whitespace-nowrap">Línea:</span>
              <div className="flex items-center gap-2 w-full">
                <SelectLinea 
                  value={linea}
                  onChange={setLinea}
                  availableLines={availableLines}
                  isLoading={isLoadingLines}
                />
                <Info className="h-4 w-4 text-muted-foreground/70 flex-shrink-0" />
              </div>
            </div>
            {/* Reporte */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-start lg:justify-end gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-600 w-full sm:w-auto">
                    <FileText className="h-4 w-4" />
                    <span className="mx-2">Generar Reporte</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                    <FileText className="h-4 w-4" />
                    <span>Antemortem Interno</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                    <FileText className="h-4 w-4" />
                    <span>Antemortem Agrocalidad</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Totales */}
    <div
      ref={totalsRef}
      className={`grid grid-cols-1 ${showArgollas ? "sm:grid-cols-4" : "sm:grid-cols-3"} gap-4`}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-3xl font-semibold text-emerald-600">{totals.total}</CardTitle>
          <span className="text-sm text-muted-foreground">TOTAL ANIMALES</span>
        </div>
        <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
          <div className="h-6 w-6 rounded-full bg-emerald-600"></div>
        </div>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-3xl font-semibold text-blue-600">{totals.machos}</CardTitle>
          <span className="text-sm text-muted-foreground">MACHOS</span>
        </div>
        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
          <Venus className="h-6 w-6 text-blue-600" />
        </div>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-3xl font-semibold text-rose-600">{totals.hembras}</CardTitle>
          <span className="text-sm text-muted-foreground">HEMBRAS</span>
        </div>
        <div className="h-12 w-12 rounded-full bg-rose-100 flex items-center justify-center">
          <Mars className="h-6 w-6 text-rose-600" />
        </div>
        </CardHeader>
      </Card>
      {showArgollas && (
        <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-3xl font-semibold text-amber-600">{totals.argollas}</CardTitle>
            <span className="text-sm text-muted-foreground">ARGOLLAS</span>
          </div>
          <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
            <BringToFront  className="h-6 w-6 text-amber-600" />
          </div>
        </CardHeader>
        </Card>
      )}
    </div>

      {/* Contenedor de la tabla o tarjetas */}
      <div className={`relative overflow-auto ${!isMobile ? 'border-2 rounded-lg' : 'space-y-3'}`} 
           style={{ maxHeight: 'calc(100vh - 280px)' }}>
        {isLoadingData ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Cargando datos de corrales...</p>
            </div>
          </div>
        ) : data.filas.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <p className="text-muted-foreground">No hay datos disponibles para la fecha y línea seleccionada</p>
            </div>
          </div>
        ) : !isMobile ? (
          <Table>
            <TableHeader>
            <TableRow>
              <TableHead className="text-center border font-bold border-l-0"> <Hash className="inline-block w-4 h-4 mb-1 mr-2" />CORRAL</TableHead>
              <TableHead className="text-center border font-bold"> <Hash className="inline-block w-4 h-4 mb-1 mr-2" />MARCAS</TableHead>
              <TableHead className="text-center border font-bold"> <Eye className="inline-block w-4 h-4 mb-1 mr-2" />OBSERVACIONES</TableHead>
              {showArgollas && <TableHead className="text-center border font-bold"> <Coins className="inline-block w-4 h-4 mb-1 mr-2 text-amber-600" />ARGOLLAS</TableHead>}
              <TableHead className="text-center border font-bold"><User className="inline-block w-4 h-4 mb-1 mr-2 text-blue-600" />MACHOS</TableHead>
              <TableHead className="text-center border font-bold"><User className="inline-block w-4 h-4 mb-1 mr-2 text-rose-600" />HEMBRAS</TableHead>
              <TableHead className="text-center border font-bold"> <Users className="inline-block w-4 h-4 mb-1 mr-2" />TOTAL</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.filas.map((r: AntemortemRow, idx: number) => (
              <TableRow key={idx}>
                <TableCell className="font-medium text-center border border-l-0">{r.corral}</TableCell>
                <TableCell className="text-center border">
                  <div className="flex flex-wrap gap-2 justify-start">
                    {(r.marcasInfo || r.marcas.map((m, i) => ({ label: m, settingCertificateBrandsId: 0 }))).map((marcaInfo, i: number) => {
                      const { h, m: mm } = extractHMCounts(marcaInfo.label);
                      const totalAnimales = h + mm;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setSignosMarca(marcaInfo.label);
                            setSignosSettingId(marcaInfo.settingCertificateBrandsId);
                            if (marcaInfo.settingCertificateBrandsId > 0) {
                              setSignosOpen(true);
                            }
                          }}
                        >
                          <Badge variant="outline" className="bg-muted text-black font-normal hover:bg-muted/70 cursor-pointer">
                            <span className="inline-flex items-center gap-1">
                              {renderMarcaPieces(marcaInfo.label)}
                            </span>
                          </Badge>
                        </button>
                      );
                    })}
                  </div>
                </TableCell>
                <TableCell className="text-center border">
                  {r.observaciones ? (
                    <ObservacionesModal 
                      observaciones={r.observaciones}
                      statusCorralId={r.statusCorralId}
                      admissionDate={format(fecha, "yyyy-MM-dd")}
                      marcasInfo={r.marcasInfo}
                    >
                      <Button variant="ghost" size="sm" className="h-8 text-blue-600 hover:text-blue-700">
                        <Eye className="h-4 w-4 mr-1" />
                        Ver observaciones
                      </Button>
                    </ObservacionesModal>
                  ) : (
                    <span className="text-muted-foreground">Sin observaciones</span>
                  )}
                </TableCell>
                {showArgollas && (
                  <TableCell className="text-center border">
                    {editingArgollasCorral === r.corral ? (
                      <div className="flex items-center justify-center gap-2">
                        <QuantitySelector
                          quantity={tempArgollasValue}
                          onQuantityChanged={setTempArgollasValue}
                          title="Argollas"
                          className="min-w-[180px]"
                        />
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={handleCancelArgollas}
                            className="h-8 w-8 p-0 hover:bg-gray-100"
                            title="Cancelar"
                          >
                            ✕
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => handleSaveArgollas(r)}
                            disabled={savingArgollasCorral === r.corral}
                            className="h-8 w-8 p-0 bg-emerald-600 hover:bg-emerald-700 text-white"
                            title="Guardar argollas"
                          >
                            {savingArgollasCorral === r.corral ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Save  className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleArgollasClick(r.corral, r.argollas ?? 0)}
                        className="text-amber-600 hover:text-amber-700 hover:underline font-medium cursor-pointer w-full"
                      >
                        {r.argollas ?? 0}
                      </button>
                    )}
                  </TableCell>
                )}
                <TableCell className="text-center text-blue-600 font-medium border bg-blue-100/40">{r.machos}</TableCell>
                <TableCell className="text-center text-rose-600 font-medium border bg-rose-100/40">{r.hembras}</TableCell>
                <TableCell className="text-center font-semibold border">{r.total}</TableCell>
              </TableRow>
            ))}
            {/* Fila total inferior */}
            <TableRow className="bg-muted/40">
              <TableCell className="text-right font-semibold border-y-2 border-l-2">
                TOTAL ({data.filas.length} corrales)
              </TableCell>
              <TableCell className="text-right font-semibold border-y-2" colSpan={2}>
                TOTAL
              </TableCell>
              {showArgollas && <TableCell className="text-center text-amber-600 font-semibold border-y-2">{totals.argollas}</TableCell>}
              <TableCell className="text-center text-blue-600 font-semibold border-y-2">{totals.machos}</TableCell>
              <TableCell className="text-center text-rose-600 font-semibold border-y-2">{totals.hembras}</TableCell>
              <TableCell className="text-center font-semibold border-y-2 border-r-2">{totals.total}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        ) : (
          <div className="px-2 pb-16">
            {data.filas.map((item: AntemortemRow, idx: number) => (
              <AntemortemMobileCard 
                key={idx} 
                item={item} 
                showArgollas={showArgollas}
                editingArgollasCorral={editingArgollasCorral}
                tempArgollasValue={tempArgollasValue}
                savingArgollasCorral={savingArgollasCorral}
                onArgollasClick={handleArgollasClick}
                onArgollasChange={setTempArgollasValue}
                onSaveArgollas={() => handleSaveArgollas(item)}
                onCancelArgollas={handleCancelArgollas}
                admissionDate={format(fecha, "yyyy-MM-dd")}
                onViewSignosClinicas={(marca, settingId) => {
                  setSignosMarca(marca);
                  setSignosSettingId(settingId);
                  if (settingId > 0) {
                    setSignosOpen(true);
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>
        
        {/* Resumen total flotante y draggable */}
        {!isMobile && showFloatingTotals && (
          <div 
            className="fixed bg-white rounded-md shadow-lg border border-gray-200 overflow-hidden z-50 select-none"
            style={{ 
              left: `${floatingPosition.x}px`, 
              top: `${floatingPosition.y}px`,
              width: '160px'
            }}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.drag-handle')) {
                setIsDragging(true);
                dragRef.current = {
                  startX: e.clientX,
                  startY: e.clientY,
                  elemX: floatingPosition.x,
                  elemY: floatingPosition.y
                };
              }
            }}
          >
            <div className="px-2 py-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 drag-handle cursor-move">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-0.5">
                  <GripVertical className="h-2.5 w-2.5 text-white/70" />
                  <span className="text-white font-medium text-[10px]">RESUMEN</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowFloatingTotals(false);
                  }}
                  className="hover:bg-white/20 rounded p-0.5 transition-colors"
                  title="Cerrar"
                >
                  <X className="h-2.5 w-2.5 text-white" />
                </button>
              </div>
              <div className="mt-0.5">
                <span className="bg-white/20 text-white font-bold px-1 py-0.5 rounded text-[10px]">
                  {totals.total} Animales
                </span>
              </div>
            </div>
            <div className="p-1.5 bg-white space-y-0.5">
              <div className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  <span>Machos</span>
                </div>
                <span className="font-semibold">{totals.machos}</span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  <span>Hembras</span>
                </div>
                <span className="font-semibold">{totals.hembras}</span>
              </div>
              {showArgollas && (
                <div className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    <span>Argollas</span>
                  </div>
                  <span className="font-semibold">{totals.argollas}</span>
                </div>
              )}
              <div className="pt-0.5 border-t border-gray-100 text-center">
                <span className="text-[9px] text-gray-500">
                  {data.filas.length} {data.filas.length === 1 ? 'Corral' : 'Corrales'}
                </span>
              </div>
            </div>
          </div>
        )}

      {/* Totales flotantes cuando se hace scroll (solo para móviles) */}
      {totalsHidden && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 shadow-lg">
          <div
            className={`mx-auto max-w-screen-xl py-2 px-4 grid ${showArgollas ? "grid-cols-4" : "grid-cols-3"} gap-3`}
          >
            <div className="text-center">
              <div className="text-sm text-muted-foreground">TOTAL</div>
              <div className="text-lg font-semibold text-emerald-600">{totals.total}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">MACHOS</div>
              <div className="text-lg font-semibold text-blue-600">{totals.machos}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">HEMBRAS</div>
              <div className="text-lg font-semibold text-rose-600">{totals.hembras}</div>
            </div>
            {showArgollas && (
              <div className="text-center">
                <div className="text-sm text-muted-foreground">ARGOLLAS</div>
                <div className="text-lg font-semibold text-amber-600">{totals.argollas}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de signos clínicos */}
      <SignosClinicosModal
        open={signosOpen}
        onOpenChange={setSignosOpen}
        marcaLabel={signosMarca}
        settingCertificateBrandsId={signosSettingId}
        idSpecie={signosIdSpecie}
      />


    </div>
  );
}

export default AntemortemManagement;
