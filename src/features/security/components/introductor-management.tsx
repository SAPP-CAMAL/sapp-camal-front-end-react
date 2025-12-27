'use client';

import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { ShieldIcon, SearchIcon, IdCardIcon, TagIcon, Beef, Activity, XIcon } from 'lucide-react';
import { ReportDownloadButtons } from '@/components/report-download-buttons';
import { fetchWithFallback } from '@/lib/ky';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { TableIntroducers } from './table-introducers';
import { getAllSpecie, getIntroducersService } from '../server/db/security.queries';
import { Avatar, AvatarImage, AvatarFallback } from '@radix-ui/react-avatar';
import { NewIntroductor } from './new-introductor';
import { useEffect, useState } from 'react';
import { Specie } from '../domain';
import { UpdateIntroductor } from './update-introductor';
import { UpdateBrands } from './update-brands';
import { getRolesService } from '@/features/roles/server/db/roles.service';
import { toCapitalize } from '@/lib/toCapitalize';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useDebouncedCallback } from 'use-debounce';
import { useSearchParams } from 'next/navigation';

export function IntroductorManagement() {
	const searchIntroducersParams = useSearchParams();
	const [species, setSpecies] = useState<Specie[]>([]);
	const [loading, setLoading] = useState(true);
	const [introducerRolId, setintroducerRolId] = useState<number>();
	const [searchParams, setSearchParams] = useQueryStates(
		{
			page: parseAsInteger.withDefault(1),
			limit: parseAsInteger.withDefault(10),
			fullName: parseAsString.withDefault(''),
			brandName: parseAsString.withDefault(''),
			identification: parseAsString.withDefault(''),
			status: parseAsString.withDefault('*'),
			species: parseAsArrayOf(parseAsString).withDefault([]),
		},
		{
			history: 'push',
		}
	);

	const query = useQuery({
		queryKey: ['introducers', searchParams],
		queryFn: () =>
			getIntroducersService({
				page: searchParams.page,
				limit: searchParams.limit,
				...(!!searchParams.fullName && { fullName: searchParams.fullName }),
				...(!!searchParams.brandName && {
					brandName: searchParams.brandName,
				}),
				...(!!searchParams.identification && {
					identification: searchParams.identification,
				}),
				...(searchParams.status !== '*' && {
					status: searchParams.status === 'true',
				}),
				...(searchParams.species.includes('*') ? { species: [] } : { species: searchParams.species }),
			}),
	});

	const debounceFullName = useDebouncedCallback(
		(text: string) => setSearchParams({ fullName: text, page: 1 }),
		500
	);

	const debounceIdentification = useDebouncedCallback(
		(text: string) => setSearchParams({ identification: text, page: 1 }),
		500
	);

	const debounceBrandName = useDebouncedCallback(
		(text: string) => setSearchParams({ brandName: text, page: 1 }),
		500
	);

	const hasActiveFilters = 
		searchParams.fullName.trim() !== '' ||
		searchParams.identification.trim() !== '' ||
		searchParams.brandName.trim() !== '' ||
		(searchParams.species.length > 0 && !searchParams.species.includes('*')) ||
		searchParams.status !== '*';

	const clearFilters = () => {
		setSearchParams({
			fullName: '',
			identification: '',
			brandName: '',
			species: [],
			status: '*',
			page: 1,
		});
	};

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
				const [speciesResp, rolesResp] = await Promise.all([
					getAllSpecie(),
					getRolesService({
						page: 1,
						limit: 10,
						name: 'INTRODUCTOR',
						status: 'true',
					}),
				]);
				setSpecies(speciesResp?.data?.items || speciesResp?.data || []);
				setintroducerRolId(rolesResp?.data?.items?.[0]?.id || undefined);
			} catch (error) {
				console.error('Error fetching data:', error);
				setSpecies([]);
				setintroducerRolId(undefined);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	const [isLoadingExcel, setIsLoadingExcel] = useState(false);
	const [isLoadingPdf, setIsLoadingPdf] = useState(false);

	async function handleDownloadReport(type: 'EXCEL' | 'PDF') {
		if (type === 'EXCEL') setIsLoadingExcel(true);
		if (type === 'PDF') setIsLoadingPdf(true);
		try {
			// Construir body con filtros actuales
			const body: any = {
				page: searchParams.page,
				limit: searchParams.limit,
			};
			if (searchParams.fullName && searchParams.fullName.length > 0) body.fullName = searchParams.fullName;
			if (searchParams.identification && searchParams.identification.length > 0) body.identification = searchParams.identification;
			if (searchParams.brandName && searchParams.brandName.length > 0) body.brandName = searchParams.brandName;
			if (searchParams.species && searchParams.species.length > 0 && !searchParams.species.includes('*')) body.species = searchParams.species;
			if (searchParams.status === 'true') body.status = true;
			if (searchParams.status === 'false') body.status = false;

			const endpoint = `/v1/1.0.0/introducers/search-report?reportType=${type}`;
			// Obtener token manualmente
			let token = '';
			if (typeof document !== 'undefined') {
				const match = document.cookie.match(/accessToken=([^;]+)/);
				if (match) token = match[1];
			}
			const response = await fetchWithFallback(endpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					...(token ? { Authorization: `Bearer ${token}` } : {}),
				},
				body: JSON.stringify(body),
			});
			if (!response.ok) throw new Error('No se pudo descargar el reporte');
			const blob = await response.blob();
			const fileType = type === 'EXCEL' ? 'xlsx' : 'pdf';
			const fileName = `introductores_${Date.now()}.${fileType}`;
			const urlBlob = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = urlBlob;
			a.download = fileName;
			document.body.appendChild(a);
			a.click();
			a.remove();
			window.URL.revokeObjectURL(urlBlob);
			toast.success('Reporte descargado exitosamente');
		} catch (e) {
			toast.error('No se pudo descargar el reporte.');
		} finally {
			if (type === 'EXCEL') setIsLoadingExcel(false);
			if (type === 'PDF') setIsLoadingPdf(false);
		}
	}

	const handleDownloadExcel = () => handleDownloadReport('EXCEL');
	const handleDownloadPdf = () => handleDownloadReport('PDF');

	return (
		<div>
			<section className="mb-4 flex justify-between">
				<div className='py-0 px-2'>
					<h2>Lista de Introductores</h2>
					{/* <h1 className='font-semibold text-xl px-3'>Gestión de Introductores</h1> */}
					<p className='text-gray-600 text-sm mt-1 px-3'>
						Administra usuarios con rol de Introductor y gestiona sus marcas
					</p>
				</div>
				<ReportDownloadButtons 
					onDownloadExcel={handleDownloadExcel}
					onDownloadPdf={handleDownloadPdf}
					isLoadingExcel={isLoadingExcel}
					isLoadingPdf={isLoadingPdf}
					spinnerIcon={Loader2}
				/>
			</section>

			<Card className='mb-4'>
				<CardHeader>
					<CardTitle className='flex gap-2 items-center'>
						Filtros de Búsqueda
					</CardTitle>
					<CardDescription>
						Filtre los introductores por nombre, identificación, marca, especie o estado
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4'>
						<div className='flex flex-col w-full'>
							<label className='mb-1 text-sm font-medium text-gray-700'>
								Buscar por nombre
							</label>
							<div className='relative'>
								<SearchIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10 h-5 w-5' />
								<Input
									type='text'
									placeholder='Buscar por nombres'
									className='pl-10 pr-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 h-10'
									defaultValue={searchIntroducersParams.get('fullName') ?? ''}
									onChange={(e) => debounceFullName(e.target.value)}
								/>
							</div>
						</div>

						<div className='flex flex-col w-full'>
							<label className='mb-1 text-sm font-medium text-gray-700'>
								Buscar por identificación
							</label>
							<div className='relative'>
								<IdCardIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10 h-5 w-5' />
								<Input
									type='text'
									placeholder='Número de Identificación'
									className='pl-10 pr-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 h-10'
									defaultValue={searchIntroducersParams.get('identification') ?? ''}
									onChange={(e) => debounceIdentification(e.target.value)}
								/>
							</div>
						</div>

						<div className='flex flex-col w-full'>
							<label className='mb-1 text-sm font-medium text-gray-700'>
								Buscar por marca
							</label>
							<div className='relative'>
								<TagIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10 h-5 w-5' />
								<Input
									type='text'
									placeholder='Buscar por marcas'
									className='pl-10 pr-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 h-10'
									defaultValue={searchIntroducersParams.get('brandName') ?? ''}
									onChange={(e) => debounceBrandName(e.target.value)}
								/>
							</div>
						</div>

						<div className='flex flex-col w-full'>
							<label className='mb-1 text-sm font-medium text-gray-700'>
								Especie
							</label>
							<Select
								onValueChange={(value: string) => {
									setSearchParams({ species: value === '*' ? [] : [value], page: 1 });
								}}
								defaultValue={searchIntroducersParams.get('species') ?? '*'}
							>
								<SelectTrigger className='w-full h-10'>
									<Beef className='mr-2 h-4 w-4' />
									<SelectValue placeholder='Selecciona una especie' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='*'>Todas las especies</SelectItem>
									{species?.map((specie, index) => (
										<SelectItem key={specie.id || index} value={String(specie.name)}>
											{specie.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className='flex flex-col w-full'>
							<label className='mb-1 text-sm font-medium text-gray-700'>
								Estado
							</label>
							<Select
								onValueChange={(value) => setSearchParams({ status: value, page: 1 })}
								defaultValue={searchIntroducersParams.get('status') ?? '*'}
							>
								<SelectTrigger className='w-full h-10'>
									<Activity className='mr-2 h-4 w-4' />
									<SelectValue placeholder='Seleccione un estado' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value={'*'}>Todos los estados</SelectItem>
									<SelectItem value={'true'}>Activos</SelectItem>
									<SelectItem value={'false'}>Inactivos</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardContent>
			</Card>

			<div className='mb-4 flex justify-between items-center'>
				{hasActiveFilters && (
					<Button variant={'outline'} onClick={clearFilters}>
						<XIcon className='mr-2 h-4 w-4' />
						Limpiar Filtros
					</Button>
				)}
				<div className='flex gap-x-2 ml-auto'>
					<NewIntroductor species={species} onRefresh={query.refetch} introducerRolId={introducerRolId} />
				</div>
			</div>

			<TableIntroducers
				columns={[
					{
						accessorKey: 'name',
						header: 'Usuario',
						cell: ({ row }) => (
							<div className='flex gap-x-2 items-center'>
								<Avatar>
									{/* <AvatarImage src='https://github.com/shadcnxxx.png' /> */}
									<AvatarFallback className='bg-gray-100 p-2 rounded-full'>
																				{(
																					((row.original.fullName ?? "").split(
																						' '
																					)[0] || "")[0] || ""
																				).toUpperCase()}
																				{(
																					((row.original.fullName ?? "").split(
																						' '
																					)[1] || "")[0] || ""
																				).toUpperCase()}
									</AvatarFallback>
								</Avatar>
								<div>
									<p className='font-semibold'>{toCapitalize(row.original.fullName, true)}</p>
									<p className='text-gray-500'>{row.original.email}</p>
								</div>
							</div>
						),
					},
					{
						accessorKey: 'identification',
						header: 'Identificación',
					},
					{
						header: 'Marcas',
						cell: ({ row }) => (
							<div>
								{row.original.brands.map(brand => {
									return (
										<div key={brand.id} className='flex gap-x-2 items-center'>
											<span className='font-bold ml-2'>{brand.name}</span>
											<div>[{toCapitalize(brand.species.join(', '))}]</div>
										</div>
									);
								})}
							</div>
						),
					},
					{
						accessorKey: 'id',
						header: 'Estado',
						cell: ({ row }) => <Badge variant={row.original.status ? 'default' : 'inactive'}>{row.original.status ? 'Activo' : 'Inactivo'}</Badge>,
					},
					{
						header: 'Acciones',
						cell: ({ row }) => {
							return (
								<div className='flex items-center gap-2'>
									<UpdateIntroductor introductor={row.original} onRefresh={query.refetch} introducerRolId={introducerRolId} />

									<UpdateBrands introductor={row.original} species={species} onRefresh={query.refetch} />
								</div>
							);
						},
					},
				]}
				data={query.data?.data.items ?? []}
				meta={{
					...query.data?.data.meta,
					onChangePage: page => {
						setSearchParams({ page });
					},
					onNextPage: () => {
						setSearchParams({ page: searchParams.page + 1 });
					},
					disabledNextPage: searchParams.page >= (query.data?.data.meta.totalPages ?? 0),
					onPreviousPage: () => {
						setSearchParams({ page: searchParams.page - 1 });
					},
					disabledPreviousPage: searchParams.page <= 1,
					setSearchParams,
					searchParams,
				}}
				isLoading={query.isLoading}
				speciesData={species}
			/>
		</div>
	);
}
