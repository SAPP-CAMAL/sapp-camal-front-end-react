import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function capitalizeText(text:string){
  return text.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};