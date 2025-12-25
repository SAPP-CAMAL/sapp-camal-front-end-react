import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function capitalizeText(text: string) {
  return text.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}

export function fixUtf8(str: string | undefined): string {
  if (!str) return "";
  try {
    // Si el string contiene caracteres que sugieren una codificación UTF-8 mal interpretada
    // (como Ã seguida de otro caracter), intentamos decodificarlo.
    if (/[\u00C2-\u00C3]/.test(str)) {
      const bytes = new Uint8Array(str.split("").map((c) => c.charCodeAt(0)));
      return new TextDecoder("utf-8").decode(bytes);
    }
    return str;
  } catch (e) {
    return str;
  }
}