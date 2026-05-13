import { toast } from 'sonner';
import { Ring } from 'ldrs/react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { CircleCheckBig, Edit, MoveRight, QrCode, RotateCcw, TriangleAlert, XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Certificate } from '../domain';
import { useQrCertificateModal } from '@/features/certificate/hooks';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CreateSearchPerson } from './create-search-person';
import { useOperator } from '../hooks/use-operator';
import { useMemo } from 'react';

import 'ldrs/react/Ring.css';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface RenderSuccessButtonProps {
	closeModal: () => void;
	qrData: Certificate | null;
}

interface Props {
	btnText?: string;
	btnVariant?: 'link' | 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | null;
	extraSuccessInfoCard?: React.ReactNode;
	onSetQrData?: (qrData: Certificate) => void;
	renderSuccessButton?: (props: RenderSuccessButtonProps) => React.ReactNode;
}

export const QrCertificateModal = ({ extraSuccessInfoCard, btnText = 'Escanear QR', onSetQrData, renderSuccessButton }: Omit<Props, 'btnVariant'>) => {
	const {
		isModalOpen,
		currentTab,
		qrData,
		isLoading,
		isActive,
		isInvalid,
		isSaving,
		origin,
		origins,
		isInvalidOrigin,
		setOrigin,
		closeModal,
		setDefaultValues,
		handleSaveQrData,
		setCurrentTab,
		setIsModalOpen,
		handleScanQrData,
	} = useQrCertificateModal({ onSetQrData });

	// Operator state - Initialize and update with certificate operator if available
	const operatorInitialPerson = useMemo(() => {
		return qrData?.operator ? {
			id: qrData.operator.id,
			fullName: qrData.operator.fullName,
		} : null;
	}, [qrData?.operator]);

	// Create a reset key based on certificate code to force operator reset when QR changes
	const operatorResetKey = useMemo(() => {
		return qrData?.code || 'no-certificate';
	}, [qrData?.code]);

	const operatorHook = useOperator({
		initialPerson: operatorInitialPerson,
		resetKey: operatorResetKey
	});
	const { selectedPerson: selectedOperator } = operatorHook;

	// Handle save QR data with operator
	const handleSaveWithOperator = async () => {
		if (!selectedOperator) {
			toast.error('Debe seleccionar un operador antes de guardar el certificado');
			return;
		}

		const operatorId = selectedOperator.id;
		return await handleSaveQrData(operatorId);
	};

	return (
		<Dialog open={isModalOpen} onOpenChange={open => setIsModalOpen(open)}>
			<DialogTrigger asChild>
				<Button variant='ghost'>
					<QrCode />
					{btnText}
				</Button>
			</DialogTrigger>
			<DialogContent className='w-[95vw] max-w-3xl max-h-[98vh] overflow-y-auto gap-0 p-4 sm:p-6'>
				{/* Step-1 */}
				{currentTab === 1 && (
					<>
						<DialogHeader>
							<DialogTitle>Escaneando Código QR</DialogTitle>
							<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
								<DialogDescription>
									Posicione el código QR dentro del marco de escaneo. El sistema detectará automáticamente el código cuando esté enfocado
									correctamente.
								</DialogDescription>
								<div>
									<span className='text-sm text-muted-foreground bg-muted px-3 py-2 rounded-full whitespace-nowrap flex items-center '>
										Paso 1 de 2
									</span>
								</div>
							</div>
						</DialogHeader>

						{/* Camera */}
						<div className='space-y-2 mt-2'>
							{qrData ? (
								<>
									<QrInfo qrData={qrData} />
									<div className='space-y-2'>
										<Label className={isInvalidOrigin ? 'text-red-500' : ''}>Procedencia</Label>
										<div className='flex flex-col gap-2 p-3 border-secondary rounded-md border'>
											{origins && origins.length > 0 ? (
												origins.map(originOption => (
													<label
														key={originOption.id}
														className='flex items-center gap-3 p-2 hover:bg-background rounded-md cursor-pointer transition-colors'
													>
														<input
															type='radio'
															name='origin'
															value={originOption.id}
															checked={origin?.id === originOption.id}
															onChange={() => setOrigin(String(originOption.id))}
															className='w-4 h-4 text-primary focus:ring-primary focus:ring-2 border-gray-300 bg-primary'
														/>
														<span className='text-sm font-medium text-primary'>{originOption.description}</span>
													</label>
												))
											) : (
												<p className='text-sm text-muted-foreground text-center py-2'>No hay procedencias disponibles</p>
											)}
										</div>

										<Separator className='my-2' />

										{/* Operador Section */}
										<CreateSearchPerson
											title='Asignar Operador'
											description='Seleccione el operador responsable de este certificado.'
											className='mt-4'
											{...operatorHook}
										/>
									</div>
								</>
							) : (
								<div className='flex flex-col items-center space-y-4'>
									<div className='relative bg-black rounded-lg w-full max-w-xs aspect-square overflow-hidden'>
										{isActive && <Scanner onScan={handleScanQrData} sound={false} />}

										{isLoading && (
											<div className='flex flex-col text-white items-center justify-center h-full animate-pulse'>
												<Ring size='40' stroke='5' bgOpacity='0' speed='2' color='white' />
												Procesando información...
											</div>
										)}

										{isInvalid && (
											<div className='flex flex-col items-center justify-center h-full text-red-500'>
												<TriangleAlert />
												El código QR escaneado es inválido
											</div>
										)}
									</div>
									<div className='text-center'>
										<h3 className='font-medium text-lg'>Posicione el código QR</h3>
										<p className='text-muted-foreground'>Posicione el código QR dentro del marco de escaneo</p>
									</div>
								</div>
							)}

							<div className='flex flex-col sm:flex-row sm:justify-between gap-2 pt-4'>
								<Button variant='secondary' className='w-full sm:w-auto' onClick={() => setIsModalOpen(false)}>
									<XIcon />
									Cancelar
								</Button>

								<div className='flex flex-col sm:flex-row justify-end gap-2'>
									<Button className='w-full sm:w-auto hover:bg-primary' onClick={setDefaultValues} disabled={!isInvalid && !qrData}>
										Volver a escanear
										<RotateCcw />
									</Button>

									<Button className='w-full sm:w-auto hover:bg-primary' onClick={handleSaveWithOperator}>
										{isSaving ? 'Guardando...' : 'Guardar y Continuar'}
										<MoveRight />
									</Button>
								</div>
							</div>
						</div>
					</>
				)}

				{/* Step-2 */}
				{currentTab === 2 && (
					<>
						<DialogHeader>
							<DialogTitle>Procesando Información</DialogTitle>
							<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
								<DialogDescription>
									Procesando la información del certificado y actualizando el formulario con los datos detectados.
								</DialogDescription>
								<div>
									<span className='text-sm text-muted-foreground bg-muted px-3 py-2 rounded-full whitespace-nowrap flex items-center '>
										Paso 2 de 2
									</span>
								</div>
							</div>
						</DialogHeader>

						<div className='space-y-6 mt-2'>
							<div className='text-center space-y-4'>
								<div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto'>
									<CircleCheckBig className='text-primary' />
								</div>
								<div>
									<h3 className='text-xl font-medium text-primary'>¡Código QR Procesado Exitosamente!</h3>
									<p className='text-muted-foreground mt-1'>Toda la información del certificado ha sido extraída correctamente.</p>
								</div>
							</div>

							<div className='space-y-4'>
								<QrInfo qrData={qrData} />
							</div>

							{/* Extra success info card */}
							{extraSuccessInfoCard}

							<div className='flex flex-col sm:flex-row sm:justify-between gap-2 pt-4'>
								<Button className='w-full sm:w-auto hover:bg-green-700' onClick={() => setCurrentTab(1)}>
									<Edit />
									Editar
								</Button>

								<div className='flex flex-col sm:flex-row justify-between gap-2'>
									<Button variant='secondary' className='w-full sm:w-auto' onClick={() => setIsModalOpen(false)}>
										<XIcon />
										Cerrar
									</Button>

									{/* Extra success button */}
									{renderSuccessButton?.({
										closeModal,
										qrData,
									})}
								</div>
							</div>
						</div>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
};

const QrInfo = ({ qrData }: { qrData: Certificate | null }) => (
	<>
		<h4 className='font-medium text-primary'>Información del Certificado</h4>
		<div className='space-y-3 text-sm'>
			<div className='flex justify-between'>
				<span className='text-muted-foreground'>No. Certificado</span>
				<span className='font-medium text-primary'>{qrData && 'code' in qrData && qrData.code}</span>
			</div>
			<div className='flex justify-between gap-2'>
				<span className='text-muted-foreground'>Autorizado a:</span>
				<span>{qrData?.authorizedTo || 'N/A'}</span>
			</div>
			<div className='flex justify-between gap-2'>
				<span className='text-muted-foreground whitespace-nowrap'>Área origen:</span>
				<span>{qrData?.placeOrigin || 'N/A'}</span>
			</div>
			<div className='flex justify-between gap-2'>
				<span className='text-muted-foreground whitespace-nowrap'>Área destino:</span>
				<span>{qrData?.destinationAreaCode || 'N/A'}</span>
			</div>
			<div className='flex justify-between gap-2'>
				<span className='text-muted-foreground'>Total productos:</span>
				<span className='font-medium text-primary'>{qrData?.quantity || 0}</span>
			</div>
			<div className='flex justify-between gap-2'>
				<span className='text-muted-foreground'>Válido hasta:</span>
				<span>{qrData?.issueDate || 'N/A'}</span>
			</div>
			<div className='flex justify-between gap-2'>
				<span className='text-muted-foreground'>Vehículo:</span>
				<span>{qrData?.plateVehicle || 'N/A'}</span>
			</div>
			<div className='flex justify-between gap-2'>
				<span className='text-muted-foreground whitespace-nowrap'>Origen:</span>
				<span>{qrData?.origin?.description || 'N/A'}</span>
			</div>
		</div>
	</>
);
