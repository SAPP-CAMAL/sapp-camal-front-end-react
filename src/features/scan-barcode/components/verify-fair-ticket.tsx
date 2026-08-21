"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  SearchX,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { VerifyResult, VerifyStatus } from "../domain";
import { reclaimFairTicketByCodeService } from "../server/db/scan-barcode.service";
import { getErrorStatus, getFairErrorMessage } from "../utils/error-message";

const RESULT_STYLES: Record<
  VerifyStatus,
  { title: string; icon: typeof CheckCircle2; container: string; iconClass: string }
> = {
  validated: {
    title: "TICKET VÁLIDO",
    icon: CheckCircle2,
    container:
      "border-emerald-400 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/50",
    iconClass: "text-emerald-600",
  },
  already_claimed: {
    title: "YA RECLAMADO",
    icon: AlertCircle,
    container:
      "border-amber-400 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/50",
    iconClass: "text-amber-600",
  },
  not_found: {
    title: "NO ENCONTRADO",
    icon: SearchX,
    container: "border-destructive/50 bg-destructive/10",
    iconClass: "text-destructive",
  },
  error: {
    title: "ERROR",
    icon: XCircle,
    container: "border-destructive/50 bg-destructive/10",
    iconClass: "text-destructive",
  },
};

interface VerifyFairTicketProps {
  isActiveTab: boolean;
}

export function VerifyFairTicket({ isActiveTab }: VerifyFairTicketProps) {
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const focusInput = useCallback(() => {
    if (!isActiveTab) return;
    inputRef.current?.focus();
  }, [isActiveTab]);

  useEffect(() => {
    focusInput();
  }, [focusInput]);

  useEffect(() => {
    if (!isActiveTab) return;
    const handleClick = () => {
      if (isVerifying) return;
      inputRef.current?.focus();
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [isActiveTab, isVerifying]);

  const verifyCode = async (rawCode: string) => {
    const trimmed = rawCode.trim();
    if (!trimmed) {
      toast.error("Ingrese o escanee el código del ticket impreso");
      return;
    }

    setIsVerifying(true);
    setResult(null);

    try {
      await reclaimFairTicketByCodeService(trimmed);
      setResult({
        code: trimmed,
        status: "validated",
        message: "Ticket validado y reclamado exitosamente.",
      });
      toast.success("Ticket validado correctamente");
    } catch (error) {
      const status = getErrorStatus(error);
      const message = await getFairErrorMessage(
        error,
        "Error al verificar el ticket."
      );

      if (status === 404) {
        setResult({ code: trimmed, status: "not_found", message });
        toast.error("Ticket no encontrado");
      } else if (status === 409) {
        setResult({
          code: trimmed,
          status: "already_claimed",
          message: `El ticket ${trimmed} ya fue reclamado anteriormente.`,
        });
        toast.warning("Ticket ya reclamado");
      } else {
        setResult({ code: trimmed, status: "error", message });
        toast.error(message);
      }
    } finally {
      setIsVerifying(false);
      setCode("");
      if (inputRef.current) inputRef.current.value = "";
      setTimeout(focusInput, 100);
    }
  };

  const handleKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter" || isVerifying) return;
    event.preventDefault();
    // El lector físico teclea y manda Enter más rápido de lo que React
    // propaga el estado: hay que leer el valor del DOM, no el del closure.
    await verifyCode(event.currentTarget.value);
  };

  const style = result ? RESULT_STYLES[result.status] : null;
  const ResultIcon = style?.icon;

  return (
    <div className="space-y-5">
      <section className="space-y-3">
        <h2 className="text-base font-semibold">Escaneá el ticket impreso</h2>
        <p className="text-sm text-muted-foreground">
          Al validarlo queda marcado como reclamado y no se puede volver a usar.
        </p>

        <div className="relative w-full">
  <ShieldCheck
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
    disabled={isVerifying}
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


        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            size="lg"
            onClick={() => verifyCode(code)}
            disabled={isVerifying || !code.trim()}
            className="w-full sm:w-auto"
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verificando...
              </>
            ) : (
              "Verificar"
            )}
          </Button>
          {(code.trim() || result) && (
            <Button
              size="lg"
              variant="ghost"
              onClick={() => {
                setCode("");
                setResult(null);
                focusInput();
              }}
              className="w-full sm:w-auto"
            >
              Limpiar
            </Button>
          )}
        </div>
      </section>

      {result && style && ResultIcon && (
        <div
          className={cn(
            "flex flex-col items-center gap-3 rounded-xl border-2 p-6 text-center",
            style.container
          )}
        >
          <ResultIcon className={cn("h-14 w-14", style.iconClass)} />
          <p className={cn("text-2xl font-bold tracking-wide", style.iconClass)}>
            {style.title}
          </p>
          <p className="font-mono text-sm font-semibold">{result.code}</p>
          <p className="max-w-md text-sm text-muted-foreground">{result.message}</p>
        </div>
      )}
    </div>
  );
}
