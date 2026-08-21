"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  Barcode as BarcodeIcon,
  CheckCircle,
  Loader2,
  Printer,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProductiveStage } from "@/features/productive-stage/domain";
import { Specie } from "@/features/specie/domain";

import { ActiveStageBar } from "./active-stage-bar";
import { FairTicketPreview } from "./fair-ticket-preview";
import { StageSelector } from "./stage-selector";
import { CODE_ENTRY_HINT, getCodeEntryMode } from "../constants";
import { FairTicketPreviewData, RegisterResult } from "../domain";
import {
  printFairTicketPdfService,
  saveFairTicketService,
} from "../server/db/scan-barcode.service";
import { getFairErrorMessage } from "../utils/error-message";

function todayForTicket(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function generateCode(): string {
  return "SG" + String(Math.floor(Math.random() * 90000000) + 10000000);
}

interface RegisterFairTicketProps {
  stages: ProductiveStage[];
  species: Specie[];
  isLoadingStages: boolean;
  isActiveTab: boolean;
}

export function RegisterFairTicket({
  stages,
  species,
  isLoadingStages,
  isActiveTab,
}: RegisterFairTicketProps) {
  const [selectedStage, setSelectedStage] = useState<ProductiveStage | null>(null);
  const [isChangingStage, setIsChangingStage] = useState(false);
  const [code, setCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [result, setResult] = useState<RegisterResult | null>(null);
  const [ticket, setTicket] = useState<FairTicketPreviewData | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const entryMode = selectedStage ? getCodeEntryMode(selectedStage.idSpecies) : null;
  const canScan = entryMode === "scan-only" || entryMode === "scan-or-generate";
  const canGenerate = entryMode === "generate-only" || entryMode === "scan-or-generate";
  const showSelector = !selectedStage || isChangingStage;

  const speciesName =
    species.find((item) => item.id === selectedStage?.idSpecies)?.name ?? "";

  const focusInput = useCallback(() => {
    if (!isActiveTab || showTicketModal || !canScan) return;
    inputRef.current?.focus();
  }, [isActiveTab, showTicketModal, canScan]);

  useEffect(() => {
    focusInput();
  }, [focusInput, showSelector]);

  // El lector físico escribe donde esté el foco: si el operario toca cualquier
  // parte de la pantalla, lo devolvemos al input de escaneo.
  useEffect(() => {
    if (!isActiveTab || showSelector || !canScan) return;
    const handleClick = () => {
      if (isProcessing || showTicketModal) return;
      inputRef.current?.focus();
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [isActiveTab, showSelector, canScan, isProcessing, showTicketModal]);

  const registerCode = async (rawCode: string) => {
    const trimmed = rawCode.trim();
    if (!trimmed) {
      toast.error("Ingrese o escanee un código");
      return;
    }
    if (!selectedStage) {
      toast.error("Seleccione una categoría");
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      const response = await saveFairTicketService({
        code: trimmed,
        productiveStageId: selectedStage.id,
      });

      if (response.code === 200 || response.code === 201) {
        setTicket({
          code: trimmed,
          id: response.data?.id,
          species: selectedStage.name,
          date: todayForTicket(),
        });
        setResult({
          code: trimmed,
          status: "success",
          message: "Boleto de feria registrado exitosamente.",
        });
        toast.success("Código registrado correctamente");
        setShowTicketModal(true);
        setCode("");
        if (inputRef.current) inputRef.current.value = "";
      } else {
        setResult({
          code: trimmed,
          status: "error",
          message: response.message || "Error al procesar el código.",
        });
        toast.error("Error al procesar el código");
      }
    } catch (error) {
      const message = await getFairErrorMessage(
        error,
        "Error de conexión con el servidor."
      );
      setResult({ code: trimmed, status: "error", message });
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter" || isProcessing) return;
    event.preventDefault();
    // El lector físico teclea y manda Enter más rápido de lo que React
    // propaga el estado: hay que leer el valor del DOM, no el del closure.
    await registerCode(event.currentTarget.value);
  };

  const handleGenerate = async () => {
    if (!selectedStage) {
      toast.error("Seleccione una categoría");
      return;
    }
    await registerCode(generateCode());
  };

  const handleSelectStage = (stage: ProductiveStage) => {
    setSelectedStage(stage);
    setIsChangingStage(false);
    setCode("");
    setResult(null);
  };

  const handlePrint = async () => {
    if (!ticket?.code) return;
    setIsPrinting(true);
    try {
      await printFairTicketPdfService(ticket.code);
      // Vuelve al registro con el foco listo para el siguiente escaneo.
      setShowTicketModal(false);
      setTimeout(focusInput, 100);
    } catch {
      toast.error("No se pudo generar el PDF del ticket");
    } finally {
      setIsPrinting(false);
    }
  };

  const handleCloseModal = (open: boolean) => {
    setShowTicketModal(open);
    if (!open) setTimeout(focusInput, 100);
  };

  return (
    <div className="space-y-5">
      {showSelector ? (
        <section className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              1
            </span>
            <h2 className="text-base font-semibold">Elegí la categoría</h2>
          </div>
          <StageSelector
            stages={stages}
            species={species}
            selectedStageId={selectedStage?.id ?? null}
            onSelect={handleSelectStage}
            isLoading={isLoadingStages}
          />
          {isChangingStage && selectedStage && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsChangingStage(false)}
            >
              Cancelar
            </Button>
          )}
        </section>
      ) : (
        <ActiveStageBar
          stage={selectedStage}
          speciesName={speciesName}
          onChange={() => setIsChangingStage(true)}
        />
      )}

      {selectedStage && !showSelector && (
        <section className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              2
            </span>
            <h2 className="text-base font-semibold">
              {canScan ? "Escaneá el código" : "Generá el código"}
            </h2>
          </div>

          <p className="text-sm text-muted-foreground">
            {entryMode ? CODE_ENTRY_HINT[entryMode] : ""}
          </p>

          {canScan && (
          <div className="relative w-full">
  <BarcodeIcon
    className="
      pointer-events-none
      absolute
      left-4
      top-1/2
      z-20
      h-5
      w-5
      -translate-y-1/2
      text-muted-foreground
    "
  />

  <Input
    ref={inputRef}
    type="text"
    inputMode="text"
    autoComplete="off"
    value={code}
    placeholder="Esperando lectura..."
    onChange={(event) => setCode(event.target.value)}
    onKeyDown={handleKeyDown}
    disabled={isProcessing}
    style={{
      paddingLeft: "40px",
    }}
    className="
      relative
      z-0
      h-14
      w-full
      pr-4
      text-lg
      font-medium
      tracking-wider
      placeholder:text-muted-foreground
      md:text-lg
    "
  />
</div>


          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            {canScan && (
              <Button
                size="lg"
                onClick={() => registerCode(code)}
                disabled={isProcessing || !code.trim()}
                className="w-full sm:w-auto"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  "Registrar"
                )}
              </Button>
            )}

            {canGenerate && (
              <Button
                size="lg"
                variant={canScan ? "outline" : "default"}
                onClick={handleGenerate}
                disabled={isProcessing}
                className="w-full sm:w-auto"
              >
                {isProcessing && !canScan ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generar código
                  </>
                )}
              </Button>
            )}

            {canScan && code.trim() && (
              <Button
                size="lg"
                variant="ghost"
                onClick={() => {
                  setCode("");
                  focusInput();
                }}
                className="w-full sm:w-auto"
              >
                Limpiar
              </Button>
            )}
          </div>
        </section>
      )}

      {result?.status === "success" && ticket && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-300 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-950/40">
          <div className="flex min-w-0 items-center gap-3">
            <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
            <div className="min-w-0">
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                Último registrado · {ticket.species}
              </p>
              <p className="truncate font-mono text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                {ticket.code}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button
              variant="outline"
              onClick={() => setShowTicketModal(true)}
              className="bg-white dark:bg-transparent"
            >
              Ver ticket
            </Button>
            <Button onClick={handlePrint} disabled={isPrinting}>
              {isPrinting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Printer className="h-4 w-4" />
              )}
              <span className="ml-2 hidden sm:inline">Imprimir</span>
            </Button>
          </div>
        </div>
      )}

      {result?.status === "error" && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-semibold text-destructive">
              No se pudo registrar
            </p>
            <p className="font-mono text-xs text-muted-foreground">{result.code}</p>
            <p className="text-sm">{result.message}</p>
          </div>
        </div>
      )}

      <Dialog open={showTicketModal} onOpenChange={handleCloseModal}>
        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-sm">
          <DialogTitle className="sr-only">Ticket de Feria</DialogTitle>
          {ticket && (
            <div className="space-y-3">
              <div className="overflow-hidden rounded-lg border">
                <FairTicketPreview ticket={ticket} />
              </div>
              <Button
                onClick={handlePrint}
                disabled={isPrinting}
                size="lg"
                className="w-full"
              >
                {isPrinting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generando PDF...
                  </>
                ) : (
                  <>
                    <Printer className="mr-2 h-4 w-4" />
                    Imprimir Ticket
                  </>
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
