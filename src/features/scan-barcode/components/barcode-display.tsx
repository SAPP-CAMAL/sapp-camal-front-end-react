import { useMemo } from "react";
import Barcode from "react-barcode";

interface BarcodeDisplayProps {
  value: string;
  format?: "CODE128";
  width?: number;
  height?: number;
  displayValue?: boolean;
}

export function BarcodeDisplay({ value, format = "CODE128", width = 2, height = 50, displayValue = true }: BarcodeDisplayProps) {
  const barcodeProps = useMemo(
    () => ({
      value,
      format,
      width,
      height,
      displayValue,
      fontSize: 14,
      margin: 12,
      background: "#ffffff",
    }),
    [value, format, width, height, displayValue]
  );

  if (!value) return null;

  return (
    <div className="flex w-full justify-center overflow-hidden rounded-md border bg-white p-3">
      <Barcode {...barcodeProps} />
    </div>
  );
}
