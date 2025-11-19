'use client';

import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { parseAsString, useQueryStates } from 'nuqs';
import { ColumnDef, flexRender, Row } from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, FileText, Info } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { usePaginated } from '@/hooks/use-paginated';
import { DatePicker } from '@/components/ui/date-picker';
import { useGetRegisterVehicleByDate } from '@/features/vehicles/hooks';
import { DetailRegisterVehicleByDate } from '@/features/vehicles/domain';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDailyDisinfectionRegisterContext } from '../hooks/use-daily-disinfection-register-context';
import { RegisterVehicleTimeOut } from './register-vehicle-time-out';
import { toCapitalize } from '../../../lib/toCapitalize';
import { handleDownloadRegisterVehicleReport } from '../utils/handle-download-register-vehicle-report';

const columns: ColumnDef<DetailRegisterVehicleByDate, string>[] = [
	{
		header: '#',
		cell: ({ row }) => (
			<div className='flex flex-col'>
				<span className='font-medium'>{row.index + 1}</span>
			</div>
		),
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
	{
		accessorKey: 'disinfectant.name',
		header: 'Desinfectante',
	},
	{
		accessorKey: 'dosage',
		header: 'Dosificación',
	},
	{
		header: 'H. Aplic. Ingreso',
		cell: ({ row }) => <>{row.original.timeStar.split(':').slice(0, 2).join(':')}</>,
	},
	{
		header: 'H. Aplic. Salida',
		cell: ({ row }) => {
			const timeEnd = row.original.timeEnd;
			return <>{timeEnd ? timeEnd.split(':').slice(0, 2).join(':') : <RegisterVehicleTimeOut id={row.original.id} />}</>;
		},
	},
	{
		header: 'Observaciones',
		cell: ({ row }) => (
			<Tooltip>
				<TooltipTrigger asChild>
					<Info className='w-4 h-4' />
				</TooltipTrigger>
				<TooltipContent side='top' align='center'>
					{row.original.commentary || 'Sin observaciones'}
				</TooltipContent>
			</Tooltip>
		),
	},
];

// Obtener fecha actual en zona horaria local
const today = new Date();
const currentDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

export function DailyDisinfectionLogTable() {
	const [searchParams, setSearchParams] = useQueryStates({ date: parseAsString.withDefault(currentDate) }, { history: 'push' });
	const { handleSetDailyDisinfectionRegister, handleRemoveDailyDisinfectionRegister } = useDailyDisinfectionRegisterContext();

	const query = useGetRegisterVehicleByDate(searchParams.date);

	const { table } = usePaginated({ columns, data: query.data.data });

	const handleSelectRow = (e: React.MouseEvent, row: Row<DetailRegisterVehicleByDate>) => {
		row.getToggleSelectedHandler()(e);

		const isSelected = row.getIsSelected();

		if (isSelected) handleRemoveDailyDisinfectionRegister();
		else handleSetDailyDisinfectionRegister(row.original);
	};

	const handleDownloadReport = async (type: 'EXCEL' | 'PDF') => {
		const parsedDate = parseISO(searchParams.date);
		if (Number.isNaN(parsedDate.getTime())) {
			toast.error('Fecha inválida');
			return;
		}
		const formattedDate = format(parsedDate, 'yyyy-MM-dd');

		handleDownloadRegisterVehicleReport(formattedDate, type);
	};

	return (
		<div className='overflow-hidden rounded-lg border p-4'>
			<div className='py-4 px-2 flex justify-between'>
				<h2>Registros Diarios</h2>
				<div className='flex items-center gap-3'>
					<span className='whitespace-nowrap'>Filtrar por fecha</span>
					<DatePicker
						inputClassName='bg-secondary'
						selected={parseISO(searchParams.date)}
						onChange={date => {
							if (!date) return;
							const formattedDate = format(date, 'yyyy-MM-dd');
							setSearchParams({ date: formattedDate });
						}}
					/>
					<Button onClick={() => handleDownloadReport('EXCEL')}>
						<FileText />
						Generar Reporte
					</Button>
				</div>
			</div>
			<Table>
				<TableHeader>
					{table.getHeaderGroups().map(headerGroup => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map(header => {
								return (
									<TableHead key={header.id}>
										{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
									</TableHead>
								);
							})}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{query.isLoading ? (
						<TableRow>
							<TableCell colSpan={columns.length} className='h-24 text-center animate-pulse font-semibold'>
								Cargando...
							</TableCell>
						</TableRow>
					) : table.getRowModel().rows?.length ? (
						table.getRowModel().rows.map(row => (
							<TableRow key={row.id} className={row.getIsSelected() ? 'bg-blue-50' : ''} onClick={e => handleSelectRow(e, row)}>
								{row.getVisibleCells().map(cell => (
									<TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
								))}
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={columns.length} className='h-24 text-center'>
								No hay resultados
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
			<div className='flex justify-between items-center mt-4'>
				<Button variant='outline' disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>
					<ChevronLeft className='w-4 h-4' />
					Anterior
				</Button>

				<span className='text-sm text-muted-foreground text-center'>
					Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()} páginas (filtrado por fecha: {searchParams.date})
				</span>

				<Button variant='outline' disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>
					Siguiente
					<ChevronRight className='w-4 h-4' />
				</Button>
			</div>
		</div>
	);
}
