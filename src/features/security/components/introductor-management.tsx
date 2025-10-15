'use client';

import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { ShieldIcon } from 'lucide-react';
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

export function IntroductorManagement() {
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

	return (
		<div>
			<section className='mb-4 flex justify-between'>
				<div>
					<div>
						<h1 className='flex items-center gap-x-2 font-semibold text-xl'>
							<ShieldIcon />
							Introductor
						</h1>
						<p className='text-gray-600 text-sm mt-1'>Administra usuarios con rol de Introductor y gestiona sus marcas</p>
					</div>
				</div>
				<div className='flex gap-x-2'>
					{/* <Button variant={"outline"}>
            <FileTextIcon />
            Exportar
          </Button>
          <Button
            variant={"outline"}
            onClick={() => {
              query.refetch();
              setSearchParams({ species: [] });
            }}
          >
            <SquarePenIcon />
            Actualizar
          </Button> */}
					<NewIntroductor species={species} onRefresh={query.refetch} introducerRolId={introducerRolId} />
				</div>
			</section>
			<TableIntroducers
				columns={[
					{
						accessorKey: 'name',
						header: 'Usuario',
						cell: ({ row }) => (
							<div className='flex gap-x-2 items-center'>
								<Avatar>
									<AvatarImage src='https://github.com/shadcnxxx.png' />
									<AvatarFallback className='bg-gray-100 p-2 rounded-full'>
										{row.original.fullName.split(' ')[0][0].toUpperCase()}
										{row.original.fullName.split(' ')[1][0].toUpperCase()}
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
