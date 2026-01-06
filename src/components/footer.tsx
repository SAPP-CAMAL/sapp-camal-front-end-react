import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="flex flex-col items-center gap-3 sm:gap-4">
          {/* Copyright - responsive */}
          <div className="flex flex-wrap items-center justify-center gap-1 text-xs sm:text-sm text-muted-foreground text-center">
            <span>© {currentYear}</span>
            <Link
              href="https://encuba.ec"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary hover:underline transition-colors"
            >
              ENCUBA
            </Link>
            <span className="hidden xs:inline">.</span>
            <span className="hidden sm:inline">Todos los derechos reservados.</span>
          </div>

          {/* SAPP info - responsive */}
          <div className="text-xs sm:text-sm text-muted-foreground text-center px-2">
            <span className="font-semibold text-foreground block sm:inline">SAPP</span>
            <span className="hidden sm:inline"> - </span>
            <span className="block sm:inline text-[10px] sm:text-sm">
              Sistema de Automatización de Procesos Productivos
            </span>
          </div>

          {/* Links - responsive grid para móvil */}
          <div className="w-full pt-3 sm:pt-4 border-t">
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 sm:gap-x-4 text-[10px] sm:text-xs text-muted-foreground">
              <Link
                href="/terminos"
                className="hover:text-primary transition-colors"
              >
                Términos y Condiciones
              </Link>
              <span className="text-border hidden sm:inline">•</span>
              <span className="hidden sm:inline">v1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
