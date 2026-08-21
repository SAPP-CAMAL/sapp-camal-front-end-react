"use client";

import { BarcodeDisplay } from "./barcode-display";
import { FairTicketPreviewData } from "../domain";

const SEPARATOR = "--------------------------------";

interface FairTicketPreviewProps {
  ticket: FairTicketPreviewData;
}

/**
 * Vista previa del ticket físico. El formato debe seguir al PDF que genera el
 * backend (`getFairTicketReport`, 80mm POS).
 */
export function FairTicketPreview({ ticket }: FairTicketPreviewProps) {
  return (
    <div className="flex flex-col items-center gap-0 bg-white p-4 text-black">
      <p className="mt-1 text-center text-base font-bold">TICKET DE FERIA</p>

      <p className="mt-1 text-center text-xs leading-tight">
        PLAZA DE COMERCIALIZACION DE
        <br />
        GANADO EN PIE DEL CANTON RIOBAMBA
      </p>

      <p className="my-2 text-center text-xs tracking-widest">{SEPARATOR}</p>

      <p className="text-center text-xs">NRO</p>
      <p className="text-center text-sm font-bold">
        {ticket.date}-{ticket.code}
      </p>

      <div className="my-2 flex flex-col items-center gap-1">
        <BarcodeDisplay
          value={ticket.code}
          format="CODE128"
          width={2}
          height={50}
          displayValue={false}
        />
        <p className="text-xs tracking-widest">{ticket.code}</p>
      </div>

      <p className="my-2 text-center text-xs tracking-widest">{SEPARATOR}</p>

      <p className="text-center text-sm font-bold uppercase">{ticket.species}</p>

      <p className="mt-2 text-center text-xs">FECHA</p>
      <p className="text-center text-sm font-bold">{ticket.date}</p>

      <p className="my-2 text-center text-xs tracking-widest">{SEPARATOR}</p>
    </div>
  );
}
