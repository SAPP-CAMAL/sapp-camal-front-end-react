"use client";
import { useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface UseInactivityMonitorProps {
    timeoutMinutes?: number;
    timeoutSeconds?: number;
    onInactivity?: () => void;
}

/**
 * Hook para monitorear la inactividad del usuario.
 * Ayuda a prevenir que la aplicación se "muera" por sesiones expiradas o
 * versiones desactualizadas tras periodos largos de inactividad.
 */
export function useInactivityMonitor({
    timeoutMinutes,
    timeoutSeconds,
    onInactivity
}: UseInactivityMonitorProps = {}) {
    const router = useRouter();

    // Prioridad: 
    // 1. timeoutSeconds (si existe)
    // 2. timeoutMinutes (si existe)
    // 3. 120 minutos (default)
    const effectiveTimeoutSeconds = timeoutSeconds || (timeoutMinutes ? timeoutMinutes * 60 : 120 * 60);
    const timeoutMs = effectiveTimeoutSeconds * 1000;

    // Log para depuración en consola del cliente
    useEffect(() => {
        console.log(`[Auth] Inactivity monitor initialized with ${effectiveTimeoutSeconds} seconds (${effectiveTimeoutSeconds / 60} minutes)`);
    }, [effectiveTimeoutSeconds]);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastActivityRef = useRef<number>(Date.now());

    const handleInactivity = useCallback(() => {
        const inactiveTimeSeconds = Math.round((Date.now() - lastActivityRef.current) / 1000);
        console.warn(`[Inactivity] Usuario inactivo por ${inactiveTimeSeconds}s. Verificando estado...`);

        if (onInactivity) {
            onInactivity();
        } else {
            // Por defecto, avisar al usuario si ha pasado mucho tiempo
            toast.info("Has estado inactivo por un tiempo", {
                description: "Se recomienda recargar la página para asegurar que tienes la última versión y tu sesión sigue válida.",
                action: {
                    label: "Recargar",
                    onClick: () => window.location.reload()
                },
                duration: 10000,
            });
        }
    }, [onInactivity]);

    const resetTimer = useCallback(() => {
        lastActivityRef.current = Date.now();

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(handleInactivity, timeoutMs);
    }, [handleInactivity, timeoutMs]);

    useEffect(() => {
        // Eventos a monitorear
        const events = [
            "mousedown",
            "mousemove",
            "keypress",
            "scroll",
            "touchstart",
            "click"
        ];

        // Throttle resetTimer para no afectar el rendimiento
        let throttleTimer: NodeJS.Timeout | null = null;
        const throttledReset = () => {
            if (throttleTimer) return;

            resetTimer();
            throttleTimer = setTimeout(() => {
                throttleTimer = null;
            }, 5000); // Resetear cada 5 segundos para eficiencia en producción
        };

        // Iniciar el temporizador inicial
        resetTimer();

        // Agregar listeners
        events.forEach(event => {
            window.addEventListener(event, throttledReset);
        });

        return () => {
            // Limpiar al desmontar
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (throttleTimer) clearTimeout(throttleTimer);
            events.forEach(event => {
                window.removeEventListener(event, throttledReset);
            });
        };
    }, [resetTimer]);

    return {
        lastActivity: lastActivityRef.current,
        resetManually: resetTimer
    };
}
