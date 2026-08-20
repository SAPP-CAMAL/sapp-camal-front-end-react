"use client";
import React, { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Timer } from "lucide-react";

interface InactivityModalProps {
  isOpen: boolean;
  onLogout: () => void;
}

export function InactivityModal({ isOpen, onLogout }: InactivityModalProps) {
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isOpen && countdown === 0) {
      onLogout();
    }
    return () => clearInterval(timer);
  }, [isOpen, countdown, onLogout]);

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent
        className="rounded-[2.5rem] p-8 border-none shadow-2xl flex flex-col items-center justify-center bg-background"
        style={{ width: '280px', maxWidth: '280px', minWidth: '280px' }}
      >
        <AlertDialogHeader className="items-center text-center space-y-4 w-full">
          <div className="rounded-full bg-amber-50 p-4 text-amber-500">
            <Timer size={32} />
          </div>
          <div className="space-y-1">
            <AlertDialogTitle className="text-xl font-black tracking-tighter">Sesión cerrada por inactividad</AlertDialogTitle>
            <AlertDialogDescription className="text-xs font-medium text-muted-foreground/80 px-4">
              Por seguridad, se cerrará tu sesión.
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>

        <div className="py-4 text-center">
          <div className="inline-flex items-center justify-center rounded-full bg-primary/5 px-4 py-1.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
              Cerrando sesión en {countdown}s
            </p>
          </div>
        </div>

        <AlertDialogFooter className="sm:justify-center">
          <AlertDialogAction
            onClick={onLogout}
            className="w-full h-12 rounded-full bg-primary text-xs font-bold uppercase tracking-widest hover:scale-[1.02] transition-transform"
          >
            Cerrar sesión ahora
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
