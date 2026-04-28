"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, XCircle, Barcode as BarcodeIcon, Beef, Loader2, Printer } from "lucide-react";
import { saveFairTicketService } from "../server/db/scan-barcode.service";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BarcodeDisplay } from "./barcode-display";
import { createProductiveStage, getFairProductiveStagesAll, FairProductiveStage } from "@/features/productive-stage/server/db/productive-stage.service";

export function ScanBarcodeManagement() {
  const [scannedCode, setScannedCode] = useState("");
  const [selectedStageId, setSelectedStageId] = useState<number | null>(null);
  const [selectedStage, setSelectedStage] = useState<FairProductiveStage | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanResult, setScanResult] = useState<{
    code: string;
    status: "success" | "error";
    message: string;
  } | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showProductiveStageModal, setShowProductiveStageModal] = useState(false);
  const [productiveStageName, setProductiveStageName] = useState("");
  const [productiveStageDescription, setProductiveStageDescription] = useState("");
  const [isSavingProductiveStage, setIsSavingProductiveStage] = useState(false);
  const [ticketData, setTicketData] = useState<{
    code: string;
    id?: number;
    species: string;
    date: string;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const productiveStagesQuery = useQuery({
    queryKey: ["fair-productive-stages"],
    queryFn: async () => {
      const resp = await getFairProductiveStagesAll();
      return resp?.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Enfocar el input al cargar y mantener foco
  useEffect(() => {
    const focusInput = () => {
      if (inputRef.current && !isProcessing) {
        inputRef.current.focus();
      }
    };
    focusInput();
    document.addEventListener("click", focusInput);
    return () => document.removeEventListener("click", focusInput);
  }, [isProcessing]);

  // Manejar entrada del lector físico (que actúa como teclado)
  const handleKeyDown = useCallback(
    async (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !isProcessing) {
        e.preventDefault();
        const code = inputRef.current?.value?.trim();
        if (!code) return;

        if (!selectedStage) {
          toast.error("Seleccione una etapa productiva");
          return;
        }

        await processCode(code);
      }
    },
    [selectedStage, isProcessing]
  );

  const processCode = async (code: string) => {
    setIsProcessing(true);
    setScanResult(null);

    try {
      if (!selectedStage) {
        toast.error("Seleccione una etapa productiva");
        return;
      }

      const response = await saveFairTicketService({
        code,
        productiveStageId: selectedStage.id,
      });

      if (response.code === 200 || response.code === 201) {
        const now = new Date();
        const dateForTicket = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
        const ticketId = response?.data?.id ?? response?.data?.data?.id ?? response?.id;

        setTicketData({
          code,
          id: ticketId,
          species: selectedStage.name,
          date: dateForTicket,
        });

        setScanResult({
          code,
          status: "success",
          message: "Boleto de feria registrado exitosamente.",
        });
        toast.success("Código procesado correctamente");

        // Mostrar modal con el ticket
        setShowTicketModal(true);

        // Limpiar para siguiente lectura
        setScannedCode("");
        if (inputRef.current) {
          inputRef.current.value = "";
          setTimeout(() => inputRef.current?.focus(), 100);
        }

        // Limpiar filtros superiores tras guardar
        setSelectedStageId(null);
        setSelectedStage(null);
      } else {
        setScanResult({
          code,
          status: "error",
          message: response.message || "Error al procesar el código.",
        });
        toast.error("Error al procesar el código");
      }
    } catch (error: any) {
      console.error("Error al procesar el escaneo:", error);
      setScanResult({
        code,
        status: "error",
        message: error?.message || "Error de conexión con el servidor.",
      });
      toast.error("Error al procesar el escaneo");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStageChange = (value: string) => {
    const stage = productiveStagesQuery.data?.find(
      (item: FairProductiveStage) => item.id.toString() === value
    );

    if (stage) {
      setSelectedStageId(stage.id);
      setSelectedStage(stage);
    }
  };

  const handleManualSubmit = async () => {
    const code = scannedCode.trim();
    if (!code) {
      toast.error("Ingrese o escanee un código");
      return;
    }
    await processCode(code);
  };

  const handlePrint = () => {
    window.print();
    setShowTicketModal(false);
  };

  const handleCreateProductiveStage = async () => {
    const name = productiveStageName.trim();
    const description = productiveStageDescription.trim();

    if (!name || !description) {
      toast.error("Debe completar nombre y descripcion");
      return;
    }

    setIsSavingProductiveStage(true);
    try {
      await createProductiveStage({
        name,
        description,
        status: true,
      });

      toast.success("Etapa productiva creada");
      setShowProductiveStageModal(false);
      setProductiveStageName("");
      setProductiveStageDescription("");
    } catch (error) {
      toast.error("No se pudo crear la etapa productiva");
    } finally {
      setIsSavingProductiveStage(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <section className="space-y-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="font-semibold text-lg sm:text-xl">Registro de Boletos de Feria</h1>
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => setShowProductiveStageModal(true)}
          >
            Nueva etapa productiva
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Escanee el código de barras usando el lector físico USB
        </p>
      </section>

      {/* Configuración */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarcodeIcon className="h-4 w-4 text-muted-foreground opacity-50" />
            Configuración de Registro
          </CardTitle>
          <CardDescription>
            Seleccione la etapa productiva antes de escanear
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
            <div className="flex flex-col gap-1 min-w-0">
              <Label className="text-xs text-muted-foreground font-medium">
                Etapa productiva <span className="text-red-500">*</span>
              </Label>
              <Select
                value={selectedStageId?.toString() || ""}
                onValueChange={handleStageChange}
                disabled={productiveStagesQuery.isLoading}
              >
                <SelectTrigger className="w-full">
                  <Beef className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Seleccione una etapa" />
                </SelectTrigger>
                <SelectContent>
                  {productiveStagesQuery.data
                    ?.filter((stage: FairProductiveStage) => stage.status)
                    .map((stage: FairProductiveStage) => (
                      <SelectItem key={stage.id} value={stage.id.toString()}>
                        {stage.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Input para el lector físico */}
            <div className="flex flex-col gap-1 min-w-0">
              <Label className="text-xs text-muted-foreground font-medium">
                Código de Barras (Lector USB)
              </Label>
              <div className="relative">
                <BarcodeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <Input
                  ref={inputRef}
                  type="text"
                  className="pl-10 pr-3 w-full h-10"
                  placeholder="Esperando lectura del lector..."
                  value={scannedCode}
                  onChange={(e) => setScannedCode(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isProcessing || !selectedStage}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {!selectedStage
                  ? "Primero seleccione una etapa productiva"
                  : "El lector enviará el código y presionará Enter automáticamente"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          onClick={handleManualSubmit}
          disabled={
            isProcessing ||
            !scannedCode.trim() ||
            !selectedStage
          }
          className="w-full sm:w-auto"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Procesando...
            </>
          ) : (
            "Procesar Código"
          )}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setScannedCode("");
            setScanResult(null);
            if (inputRef.current) {
              inputRef.current.value = "";
              inputRef.current.focus();
            }
          }}
        >
          Limpiar
        </Button>
      </div>

      {/* Resultado del procesamiento */}
      {scanResult && (
        <Card>
          <CardHeader>
            <CardTitle>Resultado del Procesamiento</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert
              variant={
                scanResult.status === "success" ? "default" : "destructive"
              }
            >
              <div className="flex items-center gap-2">
                {scanResult.status === "success" ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertTitle>
                  {scanResult.status === "success" ? "Éxito" : "Error"}
                </AlertTitle>
              </div>
              <AlertDescription className="mt-2">
                <p>
                  <strong>Código:</strong> {scanResult.code}
                </p>
                <p className="mt-1">{scanResult.message}</p>
                {scanResult.status === "success" && ticketData && (
                  <div className="mt-4 space-y-3 sm:space-y-4 rounded-xl border bg-background p-3 sm:p-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">NRO</p>
                      <p className="text-base sm:text-lg font-bold">
                        {ticketData.id ? `${ticketData.date}-${ticketData.id}` : ticketData.date}
                      </p>
                    </div>

                    <div className="flex justify-center">
                      <BarcodeDisplay
                        value={ticketData.id ? String(ticketData.id) : ""}
                        format="CODE128"
                        width={2}
                        height={50}
                      />
                    </div>

                    <div className="text-center">
                      <p className="text-xs sm:text-sm font-semibold">
                        PLAZA DE COMERCIALIZACION DE GANADO EN PIE DEL CANTON RIOBAMBA
                      </p>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Etapa</p>
                      <p className="text-base sm:text-lg font-semibold">{ticketData.species}</p>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Fecha</p>
                      <p className="text-base">{ticketData.date}</p>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button onClick={() => setShowTicketModal(true)} className="w-full">
                        <Printer className="h-4 w-4 mr-2" />
                        Ver / Imprimir Ticket
                      </Button>
                    </div>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Modal de Ticket */}
      <Dialog open={showTicketModal} onOpenChange={setShowTicketModal}>
        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-md print-ticket" showCloseButton={false}>
          <DialogHeader className="print-hide">
            <DialogTitle className="text-center">Ticket de Feria</DialogTitle>
          </DialogHeader>
          {ticketData && (
            <div className="print-ticket-body space-y-3 sm:space-y-4 p-3 sm:p-4 border rounded-lg bg-white">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">NRO</p>
                <p className="text-base sm:text-lg font-bold">
                  {ticketData.id ? `${ticketData.date}-${ticketData.id}` : ticketData.date}
                </p>
              </div>

              <div className="flex justify-center">
                <BarcodeDisplay
                  value={ticketData.id ? String(ticketData.id) : ""}
                  format="CODE128"
                  width={2}
                  height={50}
                />
              </div>

              <div className="text-center">
                <p className="text-xs sm:text-sm font-semibold">
                  PLAZA DE COMERCIALIZACION DE GANADO EN PIE DEL CANTON RIOBAMBA
                </p>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">Etapa</p>
                <p className="text-base sm:text-lg font-semibold">{ticketData.species}</p>
              </div>

              <div className="text-center print-hide">
                <p className="text-sm text-muted-foreground">Fecha</p>
                <p className="text-base">{ticketData.date}</p>
              </div>

              <Button onClick={handlePrint} className="w-full print-hide">
                <Printer className="h-4 w-4 mr-2" />
                Imprimir Ticket
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal nueva etapa productiva */}
      <Dialog open={showProductiveStageModal} onOpenChange={setShowProductiveStageModal}>
        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Nueva etapa productiva</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                value={productiveStageName}
                onChange={(e) => setProductiveStageName(e.target.value)}
                placeholder="Etapa"
              />
            </div>
            <div className="space-y-2">
              <Label>Descripcion</Label>
              <Textarea
                value={productiveStageDescription}
                onChange={(e) => setProductiveStageDescription(e.target.value)}
                placeholder="Etapa para animales bovinos"
                rows={3}
              />
            </div>
            <Button
              type="button"
              onClick={handleCreateProductiveStage}
              disabled={isSavingProductiveStage}
              className="w-full"
            >
              {isSavingProductiveStage ? "Guardando..." : "Crear etapa"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ScanBarcodeManagement;
