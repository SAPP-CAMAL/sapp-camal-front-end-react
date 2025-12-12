import Link from "next/link";
import { Heart } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Copyright © {currentYear}</span>
            <Link
              href="https://encuba.ec"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary hover:underline transition-colors"
            >
              ENCUBA
            </Link>
            <span>. Todos los derechos reservados.</span>
          </div>

          {/* Divider - solo visible en desktop */}
          <div className="hidden md:block h-4 w-px bg-border" />

          {/* Additional info */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {/* <span>Desarrollado con</span>
            <Heart className="h-4 w-4 text-red-500 fill-red-500 animate-pulse" /> */}
            {/* <span>por</span> */}
            <span className="font-semibold text-foreground">SAPP - Sistema de Automatización de Procesos Productivos</span>
          </div>
        </div>

        {/* Links adicionales - opcional */}
        <div className="mt-4 pt-4 border-t flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
          <Link
            href="/terminos"
            className="hover:text-primary transition-colors"
          >
            Términos de uso
          </Link>
          <span>•</span>
          <Link
            href="/privacidad"
            className="hover:text-primary transition-colors"
          >
            Política de privacidad
          </Link>
          <span>•</span>
          <Link
            href="/soporte"
            className="hover:text-primary transition-colors"
          >
            Soporte técnico
          </Link>
          <span>•</span>
          <span>Versión 1.0.0</span>
        </div>
      </div>
    </footer>
  );
}
