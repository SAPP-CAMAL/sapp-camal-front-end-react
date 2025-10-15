'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import { useReceptionContext } from '../hooks/use-reception-context';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface NavigationGuardProps {
	children: React.ReactNode;
}

export const NavigationGuard = ({ children }: NavigationGuardProps) => {
	const { step3Accordion, animalAdmissionList, animalTransportData } = useReceptionContext();
	const [showExitDialog, setShowExitDialog] = useState(false);
	const [isNavigating, setIsNavigating] = useState(false);
	const [targetUrl, setTargetUrl] = useState<string | null>(null);
	const pathname = usePathname();
	const router = useRouter();

	// Determinar si el flujo está en progreso pero incompleto
	const isFlowInProgress = animalAdmissionList.length > 0;
	const isFlowCompleted = step3Accordion.state === 'completed' && animalTransportData !== undefined;
	const hasUnsavedWork = isFlowInProgress && !isFlowCompleted;

	// Proteger contra salida de la página sin completar el flujo
	useEffect(() => {
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			if (hasUnsavedWork) {
				e.preventDefault();
				e.returnValue = 'Tienes un proceso de ingreso de animales sin completar. ¿Estás seguro de que deseas salir?';
			}
		};

		window.addEventListener('beforeunload', handleBeforeUnload);
		return () => window.removeEventListener('beforeunload', handleBeforeUnload);
	}, [hasUnsavedWork]);

	// Interceptar navegación interna (clicks en el menú y links)
	useEffect(() => {
		const handleClick = (e: MouseEvent) => {
			// Solo interceptar si hay trabajo sin guardar
			if (!hasUnsavedWork) return;

			const target = e.target as HTMLElement;
			// Buscar el link más cercano (puede estar en un parent)
			const link = target.closest('a[href], button[type="button"]');

			// Si es un link
			if (link && link instanceof HTMLAnchorElement) {
				const href = link.getAttribute('href');
				// Interceptar si es una navegación a otra página (no hash, no mismo path)
				if (href && href !== pathname && !href.startsWith('#') && href.startsWith('/')) {
					e.preventDefault();
					e.stopPropagation();
					e.stopImmediatePropagation();
					setTargetUrl(href);
					setShowExitDialog(true);
				}
			}
		};

		// Usar capture phase para interceptar antes que otros handlers
		document.addEventListener('click', handleClick, { capture: true });
		return () => document.removeEventListener('click', handleClick, { capture: true });
	}, [hasUnsavedWork, pathname]);

	const handleConfirmExit = () => {
		setIsNavigating(true);
		setShowExitDialog(false);
		
		// Navegar a la URL de destino si existe
		if (targetUrl) {
			router.push(targetUrl);
			setTargetUrl(null);
		} else {
			// Si no hay URL, ir hacia atrás
			router.back();
		}
	};

	const handleCancelExit = () => {
		setShowExitDialog(false);
		setTargetUrl(null);
	};

	return (
		<>
			{children}

			{/* Dialog de confirmación al intentar salir */}
			<Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle className='flex items-center gap-2'>
							<AlertTriangle className='w-5 h-5 text-primary' />
							¿Salir sin completar el proceso?
						</DialogTitle>
						<DialogDescription asChild>
							<div className='space-y-2'>
								<p className='text-black'>Tienes un proceso de ingreso de animales en curso que no ha sido completado.</p>
								<p className='font-semibold text-primary'>
									Si sales ahora, perderás todo el progreso y tendrás que comenzar desde cero.
								</p>
								<p className='text-sm text-black'>Para completar el proceso, debes:</p>
								<ul className='text-sm list-disc list-inside space-y-1 ml-2'>
									<li>Registrar los animales (Paso 2)</li>
									<li>Completar las condiciones de transporte (Paso 3)</li>
									<li>Guardar toda la información</li>
								</ul>
							</div>
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className='gap-2'>
						<Button variant='outline' onClick={handleCancelExit}>
							Continuar editando
						</Button>
						<Button variant='ghost' className='hover:bg-primary hover:text-white text-primary' onClick={handleConfirmExit}>
							Salir de todos modos
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
};
