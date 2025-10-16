'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Check, XIcon } from 'lucide-react';
import { ColumnDef, flexRender } from '@tanstack/react-table';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePaginated } from '@/hooks/use-paginated';
import { toCapitalize } from '@/lib/toCapitalize';
import { updateCertificateShipperService } from '@/features/certificate/server/db/certificate.service';
import { useGetRegisterVehicleByDate } from '@/features/vehicles/hooks';
import { DetailRegisterVehicleByDate } from '@/features/vehicles/domain';

interface ChangeShipperModalProps {
	triggerButton: React.ReactNode;
	certificateId: number;
	certificateCode: string;
	onShipperChanged: (registerVehicle: DetailRegisterVehicleByDate) => void;
}

const columns: ColumnDef<DetailRegisterVehicleByDate, string>[] = [
	{
		header: '#',
		cell: ({ row }) => <span className='font-medium'>{row.index + 1}</span>,
	},
	{
		accessorKey: 'registerVehicle.shipping.person.fullName',
		header: 'Chofer',
		cell: ({ row }) => toCapitalize(row.original.registerVehicle?.shipping?.person?.fullName ?? '', true),
	},
	{
		accessorKey: 'registerVehicle.shipping.vehicle.plate',
		header: 'Placa',
		cell: ({ row }) => row.original.registerVehicle?.shipping?.vehicle?.plate ?? '',
	},
	{
		accessorKey: 'registerVehicle.shipping.vehicle.vehicleDetail.vehicleType.name',
		header: 'Tipo Vehículo',
		cell: ({ row }) => toCapitalize(row.original.registerVehicle?.shipping?.vehicle?.vehicleDetail?.vehicleType?.name ?? '', true),
	},
	{
		accessorKey: 'species.name',
		header: 'Especies',
		cell: ({ row }) => toCapitalize(row.original.species.name ?? '', true),
	},
];

export const ChangeShipperModal = ({ triggerButton, certificateId, certificateCode, onShipperChanged }: ChangeShipperModalProps) => {
	const [open, setOpen] = useState(false);
	const [selectedRegisterVehicle, setSelectedRegisterVehicle] = useState<DetailRegisterVehicleByDate | null>(null);
	const [isUpdating, setIsUpdating] = useState(false);

	// Fecha actual para el filtro
	const currentDate = new Date().toISOString().split('T').at(0)!;
	const [date, setDate] = useState(currentDate);

	const query = useGetRegisterVehicleByDate(date);

	const { table } = usePaginated({ columns, data: query.data.data });

	const handleSelectRow = (registerVehicle: DetailRegisterVehicleByDate) => {
		setSelectedRegisterVehicle(registerVehicle);
	};

	const handleConfirmChange = async () => {
		if (!selectedRegisterVehicle) return;

		setIsUpdating(true);
		try {
			const shippingId = selectedRegisterVehicle.registerVehicle?.shipping?.id;
			if (!shippingId) {
				toast.error('No se pudo obtener el ID del transportista');
				return;
			}

			await updateCertificateShipperService(certificateId, { 
				shippingsId: shippingId,
				code: certificateCode
			});
			toast.success('Transportista actualizado correctamente');
			onShipperChanged(selectedRegisterVehicle);
			setOpen(false);
			// Reset
			setSelectedRegisterVehicle(null);
		} catch (error) {
			toast.error('Error al actualizar el transportista');
		} finally {
			setIsUpdating(false);
		}
	};

	return (
		<>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>{triggerButton}</DialogTrigger>
				<DialogContent className='w-[98vw] h-[95vh] flex flex-col p-0' style={{ maxWidth: '98vw' }}>
					<DialogHeader className='px-6 pt-6 pb-4 border-b'>
						<DialogTitle className='text-2xl font-bold'>Cambiar Transportista del Certificado</DialogTitle>
						<DialogDescription className='text-base mt-2'>
							Seleccione un transportista de la lista de registros diarios. Haga clic en una fila para seleccionar.
						</DialogDescription>
					</DialogHeader>

					<div className='flex-1 overflow-y-auto px-6 py-4'>
						<div className='space-y-6'>
							{/* Filtro por fecha con mejor diseño */}
							<div className='bg-muted/50 p-4 rounded-lg border'>
								<div className='flex items-center gap-4'>
									<label className='text-sm font-medium whitespace-nowrap'>Filtrar por fecha:</label>
									<Input 
										value={date} 
										type='date' 
										onChange={e => setDate(e.target.value)} 
										className='max-w-xs bg-background'
									/>
									<div className='ml-auto text-sm text-muted-foreground'>
										{query.data.data.length} {query.data.data.length === 1 ? 'registro' : 'registros'} encontrados
									</div>
								</div>
							</div>

							{/* Tabla de transportistas con scroll interno */}
							<div className='border rounded-lg overflow-hidden shadow-sm'>
								<div className='overflow-x-auto'>
									<Table>
										<TableHeader className='bg-muted/50 sticky top-0'>
											{table.getHeaderGroups().map(headerGroup => (
												<TableRow key={headerGroup.id}>
													{headerGroup.headers.map(header => (
														<TableHead key={header.id} className='font-semibold text-foreground h-12'>
															{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
														</TableHead>
													))}
												</TableRow>
											))}
										</TableHeader>
										<TableBody>
											{query.isLoading ? (
												<TableRow>
													<TableCell colSpan={columns.length} className='h-32 text-center'>
														<div className='flex flex-col items-center gap-2'>
															<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
															<span className='text-muted-foreground'>Cargando registros...</span>
														</div>
													</TableCell>
												</TableRow>
											) : table.getRowModel().rows?.length ? (
												table.getRowModel().rows.map(row => (
													<TableRow
														key={row.id}
														className='cursor-pointer hover:bg-primary/5 transition-colors duration-150 h-14'
														onClick={() => handleSelectRow(row.original)}
													>
														{row.getVisibleCells().map(cell => (
															<TableCell key={cell.id} className='py-3'>
																{flexRender(cell.column.columnDef.cell, cell.getContext())}
															</TableCell>
														))}
													</TableRow>
												))
											) : (
												<TableRow>
													<TableCell colSpan={columns.length} className='h-32 text-center'>
														<div className='flex flex-col items-center gap-2 text-muted-foreground'>
															<svg className='w-12 h-12 opacity-50' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
																<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4' />
															</svg>
															<span className='font-medium'>No hay registros para la fecha seleccionada</span>
															<span className='text-sm'>Intente seleccionar otra fecha</span>
														</div>
													</TableCell>
												</TableRow>
											)}
										</TableBody>
									</Table>
								</div>
							</div>
						</div>
					</div>

					<DialogFooter className='px-6 py-4 border-t bg-muted/30'>
						<Button variant='outline' onClick={() => setOpen(false)} size='lg'>
							<XIcon className='w-4 h-4 mr-2' />
							Cancelar
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Dialog de confirmación */}
			{selectedRegisterVehicle && (
				<Dialog open={true} onOpenChange={(open) => !open && setSelectedRegisterVehicle(null)}>
					<DialogContent className='max-w-2xl'>
						<DialogHeader>
							<DialogTitle className='text-xl flex items-center gap-2'>
								<Check className='w-6 h-6 text-primary' />
								¿Confirmar cambio de transportista?
							</DialogTitle>
							<DialogDescription>
								Se cambiará el transportista asignado a este certificado por el seleccionado.
							</DialogDescription>
						</DialogHeader>
						
						<div className='space-y-4 py-4'>
							<p className='text-base text-muted-foreground'>Nuevo transportista seleccionado:</p>
							<div className='bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3'>
								<div className='flex items-start gap-3'>
									<span className='font-semibold text-primary min-w-[80px]'>Chofer:</span>
									<span className='text-foreground font-medium'>{toCapitalize(selectedRegisterVehicle.registerVehicle?.shipping?.person?.fullName ?? '', true)}</span>
								</div>
								<div className='flex items-start gap-3'>
									<span className='font-semibold text-primary min-w-[80px]'>Placa:</span>
									<span className='text-foreground font-mono font-bold text-lg'>{selectedRegisterVehicle.registerVehicle?.shipping?.vehicle?.plate ?? ''}</span>
								</div>
								<div className='flex items-start gap-3'>
									<span className='font-semibold text-primary min-w-[80px]'>Vehículo:</span>
									<span className='text-foreground'>{toCapitalize(selectedRegisterVehicle.registerVehicle?.shipping?.vehicle?.vehicleDetail?.vehicleType?.name ?? '', true)}</span>
								</div>
							</div>
							<p className='text-sm text-muted-foreground bg-muted/50 border border-muted/20 rounded p-3'>
								⚠️ Esta acción actualizará el certificado con el nuevo transportista seleccionado.
							</p>
						</div>

						<DialogFooter className='gap-2'>
							<Button 
								variant='outline' 
								size='lg' 
								disabled={isUpdating}
								onClick={() => setSelectedRegisterVehicle(null)}
							>
								<XIcon className='w-4 h-4 mr-2' />
								No, cancelar
							</Button>
							<Button
								variant='ghost'
								className='bg-primary hover:bg-primary hover:text-white text-white'
								size='lg'
								disabled={isUpdating}
								onClick={handleConfirmChange}
							>
								<Check className='w-4 h-4 mr-2' />
								{isUpdating ? 'Actualizando...' : 'Sí, cambiar transportista'}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			)}
		</>
	);
};
