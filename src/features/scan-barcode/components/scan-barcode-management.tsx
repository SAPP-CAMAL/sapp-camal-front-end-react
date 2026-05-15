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
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Barcode as BarcodeIcon,
  Beef,
  Loader2,
  Printer,
  ShieldCheck,
} from "lucide-react";
import {
  saveFairTicketService,
  reclaimFairTicketByCodeService,
  printFairTicketPdfService,
} from "../server/db/scan-barcode.service";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BarcodeDisplay } from "./barcode-display";
import {
  createProductiveStage,
  getAllProductiveStages,
} from "@/features/productive-stage/server/db/productive-stage.service";
import { ProductiveStage } from "@/features/productive-stage/domain";

async function getBackendMessage(error: any, fallback: string): Promise<string> {
  try {
    const body = await error?.response?.json();
    return body?.message || fallback;
  } catch {
    return error?.message || fallback;
  }
}

type ScanResult = {
  code: string;
  status: "success" | "error";
  message: string;
};

type VerifyResult = {
  id: string;
  status: "validated" | "not_found" | "already_claimed" | "error";
  message: string;
};

export function ScanBarcodeManagement() {
  const queryClient = useQueryClient();
  const [scannedCode, setScannedCode] = useState("");
  const [selectedStageId, setSelectedStageId] = useState<number | null>(null);
  const [selectedStage, setSelectedStage] = useState<ProductiveStage | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showProductiveStageModal, setShowProductiveStageModal] = useState(false);
  const [productiveStageName, setProductiveStageName] = useState("");
  const [productiveStageDescription, setProductiveStageDescription] = useState("");
  const [isSavingProductiveStage, setIsSavingProductiveStage] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [ticketData, setTicketData] = useState<{
    code: string;
    id?: number;
    species: string;
    date: string;
  } | null>(null);

  const [verifyInput, setVerifyInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<VerifyResult | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const verifyInputRef = useRef<HTMLInputElement>(null);

  const productiveStagesQuery = useQuery({
    queryKey: ["productive-stages-all"],
    queryFn: async () => {
      const resp = await getAllProductiveStages();
      return resp?.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const focusInput = (e: MouseEvent) => {
      const target = e.target as Node;
      if (verifyInputRef.current?.contains(target)) return;
      if (inputRef.current && !isProcessing) {
        inputRef.current.focus();
      }
    };
    document.addEventListener("click", focusInput);
    return () => document.removeEventListener("click", focusInput);
  }, [isProcessing]);

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

        setShowTicketModal(true);

        setScannedCode("");
        if (inputRef.current) {
          inputRef.current.value = "";
          setTimeout(() => inputRef.current?.focus(), 100);
        }

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
      const message = await getBackendMessage(error, "Error de conexión con el servidor.");
      setScanResult({ code, status: "error", message });
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStageChange = (value: string) => {
    const stage = productiveStagesQuery.data?.find(
      (item: ProductiveStage) => item.id.toString() === value
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

  const handlePrint = async () => {
    if (!ticketData?.code) return;
    setIsPrinting(true);
    try {
      await printFairTicketPdfService(ticketData.code);
    } catch {
      toast.error("No se pudo generar el PDF del ticket");
    } finally {
      setIsPrinting(false);
    }
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
      await createProductiveStage({ name, description, status: true });
      await queryClient.invalidateQueries({ queryKey: ["fair-productive-stages"] });
      toast.success("Etapa productiva creada");
      setShowProductiveStageModal(false);
      setProductiveStageName("");
      setProductiveStageDescription("");
    } catch {
      toast.error("No se pudo crear la etapa productiva");
    } finally {
      setIsSavingProductiveStage(false);
    }
  };

  const handleVerifyKeyDown = useCallback(
    async (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !isVerifying) {
        e.preventDefault();
        const id = verifyInputRef.current?.value?.trim();
        if (!id) return;
        await processVerify(id);
      }
    },
    [isVerifying]
  );

  const processVerify = async (rawCode: string) => {
    if (!rawCode) {
      toast.error("El código escaneado no es válido");
      return;
    }

    setIsVerifying(true);
    setVerifyResult(null);

    try {
      await reclaimFairTicketByCodeService(rawCode);
      setVerifyResult({
        id: rawCode,
        status: "validated",
        message: "Ticket validado y reclamado exitosamente.",
      });
      toast.success("Ticket validado correctamente");
    } catch (error: any) {
      const status = error?.response?.status;
      const message = await getBackendMessage(error, "Error al verificar el ticket.");
      if (status === 404) {
        setVerifyResult({ id: rawCode, status: "not_found", message });
        toast.error("Ticket no encontrado");
      } else if (status === 409) {
        setVerifyResult({
          id: rawCode,
          status: "already_claimed",
          message: `El ticket ${rawCode} ya fue reclamado anteriormente.`,
        });
        toast.warning("Ticket ya reclamado");
      } else {
        setVerifyResult({ id: rawCode, status: "error", message });
        toast.error(message);
      }
    } finally {
      setIsVerifying(false);
      setVerifyInput("");
      if (verifyInputRef.current) {
        verifyInputRef.current.value = "";
        setTimeout(() => verifyInputRef.current?.focus(), 100);
      }
    }
  };

  const handleGenerateCode = async () => {
    if (!selectedStage) {
      toast.error("Seleccione una etapa productiva");
      return;
    }
    const code = "SG" + String(Math.floor(Math.random() * 90000000) + 10000000);
    setScannedCode(code);
    if (inputRef.current) inputRef.current.value = code;
    await processCode(code);
  };

  const handleManualVerify = async () => {
    const id = verifyInput.trim();
    if (!id) {
      toast.error("Ingrese o escanee el código del ticket impreso");
      return;
    }
    await processVerify(id);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <section className="space-y-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="font-semibold text-lg sm:text-xl">Registro de Ingreso de Feria</h1>
          {/* TODO: quitar cuando confirmen — botón nueva etapa productiva deshabilitado temporalmente
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => setShowProductiveStageModal(true)}
          >
            Nueva etapa productiva
          </Button>
          */}
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
            Registro de Tickets
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
                    ?.filter((stage: ProductiveStage) => stage.status)
                    .map((stage: ProductiveStage) => (
                      <SelectItem key={stage.id} value={stage.id.toString()}>
                        {stage.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1 min-w-0">
              <Label className="text-xs text-muted-foreground font-medium">
                Código del ticket
              </Label>
              <div className="flex gap-2">
                {selectedStage && (selectedStage.idSpecies === 3 || selectedStage.idSpecies === 4) ? (
                  <>
                    <div className="relative flex-1">
                      <BarcodeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                      <Input
                        ref={inputRef}
                        type="text"
                        className="pl-10 pr-3 w-full h-10"
                        placeholder="Esperando lectura..."
                        value={scannedCode}
                        onChange={(e) => setScannedCode(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isProcessing}
                      />
                    </div>
                    {selectedStage.idSpecies === 3 ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 shrink-0"
                        onClick={handleGenerateCode}
                        disabled={isProcessing}
                      >
                        Generar código
                      </Button>
                    ) : null}
                  </>
                ) : selectedStage ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 shrink-0"
                    onClick={handleGenerateCode}
                    disabled={isProcessing}
                  >
                    Generar código
                  </Button>
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground">
                {!selectedStage
                  ? "Primero seleccione una etapa productiva"
                  : selectedStage.idSpecies === 3
                  ? "Puede escanear el código o generarlo para registrar"
                  : selectedStage.idSpecies === 4
                  ? "El lector enviará el código y presionará Enter automáticamente"
                  : "Presione Generar código para registrar"}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              onClick={handleManualSubmit}
              disabled={isProcessing || !scannedCode.trim() || !selectedStage}
              className="w-full sm:w-auto"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Registrando...
                </>
              ) : (
                "Registrar"
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
        </CardContent>
      </Card>

      {/* Resultado del registro */}
      {scanResult && (
        <Card>
          <CardHeader>
            <CardTitle>Resultado del Registro</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="default" style={{ backgroundColor: "#f8f9fa" }} className="border-0 rounded-xl">
              <div className="flex items-center gap-2">
                {scanResult.status === "success" ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-slate-400" />
                )}
                <AlertTitle className="text-sm font-semibold text-slate-700">
                  {scanResult.status === "success" ? "Registrado" : "Aviso"}
                </AlertTitle>
              </div>
              <AlertDescription className="mt-2 space-y-1">
                <p className="text-xs text-slate-500">
                  <span className="font-medium text-slate-600">Código:</span> {scanResult.code}
                </p>
                <p className="text-sm text-slate-700">{scanResult.message}</p>
                {scanResult.status === "success" && ticketData && (
                  <div className="mt-4 flex flex-col items-center gap-0 rounded-xl border bg-white p-4">

                    <p className="text-base font-bold text-center mt-1">TICKET DE FERIA</p>

                    <p className="text-xs text-center mt-1 leading-tight">
                      PLAZA DE COMERCIALIZACION DE{"\n"}GANADO EN PIE DEL CANTON RIOBAMBA
                    </p>

                    <p className="text-xs text-center my-2 tracking-widest">--------------------------------</p>

                    <p className="text-xs text-center">NRO</p>
                    <p className="text-sm font-bold text-center">
                      {ticketData.date}-{ticketData.code}
                    </p>

                    <div className="flex flex-col items-center gap-1 my-2">
                      <BarcodeDisplay
                        value={ticketData.code ?? ""}
                        format="CODE128"
                        width={2}
                        height={50}
                        displayValue={false}
                      />
                      <p className="text-xs tracking-widest">{ticketData.code}</p>
                    </div>

                    <p className="text-xs text-center my-2 tracking-widest">--------------------------------</p>

                    <p className="text-sm font-bold text-center uppercase">{ticketData.species}</p>

                    <p className="text-xs text-center mt-2">FECHA</p>
                    <p className="text-sm font-bold text-center">{ticketData.date}</p>

                    <p className="text-xs text-center my-2 tracking-widest">--------------------------------</p>

                    <Button
                      onClick={handlePrint}
                      disabled={isPrinting}
                      className="w-full mt-1"
                    >
                      {isPrinting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generando PDF...
                        </>
                      ) : (
                        <>
                          <Printer className="h-4 w-4 mr-2" />
                          Imprimir Ticket
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Sección de verificación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-muted-foreground opacity-50" />
            Verificación de Tickets
          </CardTitle>
          <CardDescription>
            Escanee el código de barras del ticket para validarlo y marcarlo como reclamado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
            <div className="flex flex-col gap-1 min-w-0">
              <Label className="text-xs text-muted-foreground font-medium">
                Código del ticket
              </Label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <Input
                  ref={verifyInputRef}
                  type="text"
                  className="pl-10 pr-3 w-full h-10"
                  placeholder="Esperando lectura..."
                  value={verifyInput}
                  onChange={(e) => setVerifyInput(e.target.value)}
                  onKeyDown={handleVerifyKeyDown}
                  disabled={isVerifying}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                El lector enviará el código del ticket y presionará Enter automáticamente
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              onClick={handleManualVerify}
              disabled={isVerifying || !verifyInput.trim()}
              variant="outline"
              className="w-full sm:w-auto"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                "Verificar"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setVerifyInput("");
                setVerifyResult(null);
                if (verifyInputRef.current) {
                  verifyInputRef.current.value = "";
                }
              }}
            >
              Limpiar
            </Button>
          </div>

          {verifyResult && (
            <Alert variant="default" style={{ backgroundColor: "#f8f9fa" }} className="border-0 rounded-xl">
              <div className="flex items-center gap-2">
                {verifyResult.status === "validated" ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-slate-400" />
                )}
                <AlertTitle className="text-sm font-semibold text-slate-700">
                  {verifyResult.status === "validated" && "Ticket válido"}
                  {verifyResult.status === "already_claimed" && "Ya reclamado"}
                  {verifyResult.status === "not_found" && "No encontrado"}
                  {verifyResult.status === "error" && "Aviso"}
                </AlertTitle>
              </div>
              <AlertDescription className="mt-2 space-y-1">
                <p className="text-xs text-slate-500">
                  <span className="font-medium text-slate-600">Código:</span> {verifyResult.id}
                </p>
                <p className="text-sm text-slate-700">{verifyResult.message}</p>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Modal de Ticket */}
      <Dialog open={showTicketModal} onOpenChange={setShowTicketModal}>
        <DialogContent
          className="w-[calc(100%-2rem)] sm:max-w-sm print-ticket"
          showCloseButton={false}
        >
          {ticketData && (
            <div className="print-ticket-body flex flex-col items-center gap-0 p-4 bg-white">
              <DialogTitle className="sr-only">Ticket de Feria</DialogTitle>

              <p className="text-base font-bold text-center mt-1">TICKET DE FERIA</p>

              <p className="text-xs text-center mt-1 leading-tight">
                PLAZA DE COMERCIALIZACION DE{"\n"}GANADO EN PIE DEL CANTON RIOBAMBA
              </p>

              <p className="text-xs text-center my-2 tracking-widest">--------------------------------</p>

              <p className="text-xs text-center">NRO</p>
              <p className="text-sm font-bold text-center">
                {ticketData.date}-{ticketData.code}
              </p>

              <div className="flex flex-col items-center gap-1 my-2">
                <BarcodeDisplay
                  value={ticketData.code ?? ""}
                  format="CODE128"
                  width={2}
                  height={50}
                  displayValue={false}
                />
                <p className="text-xs tracking-widest">{ticketData.code}</p>
              </div>

              <p className="text-xs text-center my-2 tracking-widest">--------------------------------</p>

              <p className="text-sm font-bold text-center uppercase">{ticketData.species}</p>

              <p className="text-xs text-center mt-2">FECHA</p>
              <p className="text-sm font-bold text-center">{ticketData.date}</p>

              <p className="text-xs text-center my-2 tracking-widest">--------------------------------</p>

              <Button
                onClick={handlePrint}
                disabled={isPrinting}
                className="w-full mt-1 print-hide"
              >
                {isPrinting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generando PDF...
                  </>
                ) : (
                  <>
                    <Printer className="h-4 w-4 mr-2" />
                    Imprimir Ticket
                  </>
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* TODO: quitar cuando confirmen — modal nueva etapa productiva deshabilitado temporalmente
      <Dialog
        open={showProductiveStageModal}
        onOpenChange={setShowProductiveStageModal}
      >
        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              Nueva etapa productiva
            </DialogTitle>
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
      */}
    </div>
  );
}

export default ScanBarcodeManagement;
