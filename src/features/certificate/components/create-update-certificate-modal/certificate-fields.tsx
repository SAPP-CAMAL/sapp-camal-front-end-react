import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAllOrigins } from '@/features/origin/hooks';
import { DatePicker } from '@/components/ui/date-picker';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { parseISO, format } from 'date-fns';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, User, Loader2 } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';
import { getPeopleByFilterService, createPersonService, personValidateDocument, validateDocumentTypeService } from '@/features/people/server/db/people.service';
import { useCatalogue } from '@/features/catalogues/hooks/use-catalogue';
import { toCapitalize } from '@/lib/toCapitalize';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SelectedPersonCard } from '@/features/visitor-log/components/new-visitor-log-fields.form';
import { NewPeopleFields } from '@/features/people/components/person-form-fields';
import { Separator } from '@/components/ui/separator';
import { BasicResultsCard } from '@/features/reception/components/basic-results-card';
import { Label } from '@/components/ui/label';

export const CertificateFields = () => {
	const form = useFormContext();

	const query = useAllOrigins();
	const origins = query.data.data;

	// Operator search state
	const [activeSearchField, setActiveSearchField] = useState<'name' | 'identification' | null>(null);
	const [searchName, setSearchName] = useState('');
	const [searchIdentification, setSearchIdentification] = useState('');

	const selectedPerson = form.watch('savedPerson');
	const isCreatingPerson = form.watch('isNewPerson');

	const debouncedName = useDebouncedCallback((value: string) => {
		setSearchName(value);
	}, 500);

	const debouncedIdentification = useDebouncedCallback((value: string) => {
		setSearchIdentification(value);
	}, 500);

	const peopleData = useQuery({
		queryKey: ['people-search-certificate', searchName, searchIdentification, activeSearchField],
		queryFn: () =>
			getPeopleByFilterService({
				page: 1,
				limit: 10,
				status: true,
				fullName: activeSearchField === 'name' && searchName.length > 0 ? searchName : '',
				identificacion: activeSearchField === 'identification' && searchIdentification.length > 0 ? searchIdentification : '',
			}),
		enabled: (activeSearchField === 'name' && searchName.length > 0) || (activeSearchField === 'identification' && searchIdentification.length > 0),
	});

	const [nameInput, setNameInput] = useState('');
	const [idInput, setIdInput] = useState('');
	const [isSubmittingPerson, setIsSubmittingPerson] = useState(false);

	const identification = form.watch('identification');
	const identificationType = form.watch('identificationType');
	const catalogueIdentityTypes = useCatalogue('TID');

	useEffect(() => {
		const fetchPersonDetails = async () => {
			const id = identification?.trim();
			if (!id || id.length !== 10) return;

			// Wait for catalogue to be ready
			if (!catalogueIdentityTypes.isSuccess) return;

			const identificationTypeCode = catalogueIdentityTypes.data.data.find(
				(data: any) => data.catalogueId === Number(identificationType)
			)?.code;

			if (identificationTypeCode !== 'CED') return;

			try {
				const validateResponse = await validateDocumentTypeService(identificationTypeCode, identification);
				if (!validateResponse.data.isValid) return;

				const response = await personValidateDocument(identification);
				const personData = response.data;

				if (personData.firstName) form.setValue('firstName', toCapitalize(personData.firstName, true));
				if (personData.lastName) form.setValue('lastName', toCapitalize(personData.lastName, true));
			} catch (error) {
				console.error('Error fetching person details:', error);
			}
		};

		fetchPersonDetails();
	}, [identification, identificationType, catalogueIdentityTypes.isSuccess, form]);

	const handleSelectPerson = (person: any) => {
		setActiveSearchField(null);
		form.setValue('savedPerson', person);
		form.setValue('authorizedTo', person.fullName || '');
		form.setValue('isNewPerson', false);
	};

	const handleRemovePerson = () => {
		form.setValue('savedPerson', null);
		form.setValue('authorizedTo', '');
		form.setValue('identificationType', '');
		form.setValue('identification', '');
		form.setValue('firstName', '');
		form.setValue('lastName', '');
		form.setValue('genderId', '');
		form.setValue('mobileNumber', '');
		form.setValue('address', '');
		setSearchName('');
		setSearchIdentification('');
		setNameInput('');
		setIdInput('');
		setActiveSearchField(null);
	};

	const handleCreatePerson = async () => {
		const valid = await form.trigger([
			'identificationType',
			'identification',
			'firstName',
			'lastName',
			'genderId',
			'mobileNumber',
			'status',
		]);
		if (!valid) return;

		setIsSubmittingPerson(true);
		try {
			const data = form.getValues();
			const response = await createPersonService({
				code: '',
				identification: data.identification,
				identificationTypeId: Number(data.identificationType),
				genderId: Number(data.genderId),
				mobileNumber: data.mobileNumber,
				firstName: data.firstName,
				lastName: data.lastName,
				fullName: `${data.firstName ?? ''} ${data.lastName ?? ''}`,
				address: data.address,
				affiliationDate: new Date(),
				status: data.status === 'true',
			});

			toast.success('Persona creada exitosamente');
			handleSelectPerson(response.data);
		} catch (error: any) {
			console.error(error);
			toast.error('Error al crear la persona');
		} finally {
			setIsSubmittingPerson(false);
		}
	};

	return (
		<>
			{/* code */}
			<FormField
				control={form.control}
				name='code'
				rules={{ required: { value: true, message: 'El número de certificado es requerido' } }}
				render={({ field }) => (
					<FormItem>
						<FormLabel>Número de Certificado</FormLabel>
						<FormControl>
							<Input className='bg-secondary' placeholder='Ej: CERT-2024-001' {...field} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			{/* quantity */}
			<FormField
				control={form.control}
				name='quantity'
				rules={{
					required: { value: true, message: 'El total de animales es requerido' },
					min: { value: 1, message: 'El total de animales debe ser mayor a 0' },
				}}
				render={({ field }) => (
					<FormItem>
						<FormLabel>Total de animales</FormLabel>
						<FormControl>
							<Input className='bg-secondary' type='number' placeholder='0' {...field} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			{/* issueDate - Fecha de Vigencia con hora */}
			<FormField
				control={form.control}
				name='issueDate'
				rules={{
					required: { value: true, message: 'La fecha de vigencia es requerida' },
				}}
				render={({ field }) => (
					<FormItem>
						<FormLabel>Fecha de Vigencia</FormLabel>
						<FormControl>
							<DatePicker
								inputClassName='bg-secondary'
								selected={field.value ? parseISO(field.value) : null}
								onChange={date => {
									if (date) {
										// Formatear la fecha con hora en formato ISO
										const formattedDate = format(date, "yyyy-MM-dd'T'HH:mm:ss");
										field.onChange(formattedDate);
									} else {
										field.onChange('');
									}
								}}
								showTimeSelect
								timeFormat='HH:mm'
								timeIntervals={15}
								dateFormat="d 'de' MMMM yyyy HH:mm"
								placeholderText='Seleccione fecha y hora'
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			{/* placeOrigin */}
			<FormField
				control={form.control}
				name='idOrigin'
				rules={{ required: { value: true, message: 'La procedencia es requerido' } }}
				render={({ field }) => (
					<FormItem>
						<FormLabel>Procedencia</FormLabel>
						<Select name='placeOrigin' value={field.value} onValueChange={value => field.onChange(value)}>
							<FormControl>
								<SelectTrigger className='w-full bg-secondary'>
									<SelectValue placeholder='Seleccione una procedencia' />
								</SelectTrigger>
							</FormControl>
							<SelectContent>
								{origins.map(origin => (
									<SelectItem key={origin.id} value={String(origin.id)}>
										{origin.description}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<FormMessage />
					</FormItem>
				)}
			/>

			{/* commentary - Descripción */}
			<FormField
				control={form.control}
				name='commentary'
				render={({ field }) => (
					<FormItem>
						<FormLabel>Descripción</FormLabel>
						<FormControl>
							<Textarea
								className='bg-secondary resize-none'
								placeholder='Ingrese una descripción o comentario (opcional)'
								rows={3}
								{...field}
								value={field.value || ''}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			<Separator className='my-2' />

			{/* Operador Section */}
			<Card className='border-l-4 border-l-primary'>
				<CardHeader className='pb-2'>
					<div className='flex justify-between items-center'>
						<CardTitle className='text-md flex items-center gap-2'>
							<User size={18} />
							Asignar operador al certificado
						</CardTitle>
						{!selectedPerson && (
							<Button
								type='button'
								variant='outline'
								size='sm'
								onClick={() => {
									const current = form.getValues('isNewPerson');
									form.setValue('isNewPerson', !current);
									if (!current) {
										handleRemovePerson();
									}
								}}
							>
								{isCreatingPerson ? 'Buscar Existente' : '+ Nueva Persona'}
							</Button>
						)}
					</div>
					<CardDescription>Indique la persona autorizada por este certificado.</CardDescription>
				</CardHeader>
				<CardContent className='space-y-4'>
					{isCreatingPerson ? (
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							<NewPeopleFields isUpdateVisitorLog={true} />
							<div className='col-span-1 md:col-span-2 flex justify-end gap-2 mt-4'>
								<Button
									type='button'
									variant='outline'
									onClick={() => {
										form.setValue('isNewPerson', false);
									}}
								>
									Cancelar
								</Button>
								<Button type='button' onClick={handleCreatePerson} disabled={isSubmittingPerson}>
									{isSubmittingPerson ? (
										<>
											<Loader2 className='mr-2 h-4 w-4 animate-spin' />
											Guardando...
										</>
									) : (
										'Guardar Persona'
									)}
								</Button>
							</div>
						</div>
					) : !selectedPerson ? (
						<div className='space-y-4'>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<div className='space-y-2'>
									<Label>Buscar por Nombre</Label>
									<div className='relative'>
										<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
										<Input
											type='text'
											placeholder='Escriba un nombre...'
											className='w-full border border-gray-300 rounded-md shadow-sm h-10 bg-secondary pl-10'
											value={nameInput}
											onChange={e => {
												const val = e.target.value;
												setNameInput(val);
												setIdInput('');
												debouncedName(val);
												setActiveSearchField('name');
												setSearchIdentification('');
											}}
										/>
									</div>
								</div>

								<div className='space-y-2'>
									<Label>Buscar por Identificación</Label>
									<div className='relative'>
										<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
										<Input
											type='text'
											placeholder='Escriba un número...'
											className='w-full border border-gray-300 rounded-md shadow-sm h-10 bg-secondary pl-10'
											value={idInput}
											onChange={e => {
												const val = e.target.value;
												setIdInput(val);
												setNameInput('');
												debouncedIdentification(val);
												setActiveSearchField('identification');
												setSearchName('');
											}}
										/>
									</div>
								</div>
							</div>

							{/* Search Results */}
							{(searchName.length > 0 || searchIdentification.length > 0) && (
								<div className='space-y-2'>
									<Separator />
									<div className='flex items-center justify-between'>
										<span className='text-sm font-semibold text-gray-500'>
											Resultados de búsqueda {peopleData.isFetching && '(Buscando...)'}
										</span>
									</div>
									<div className='grid gap-2 max-h-60 overflow-y-auto pr-1'>
										{peopleData.isLoading ? (
											<div className='p-4 text-center text-gray-500'>Buscando personas...</div>
										) : peopleData.data?.data?.items?.length === 0 ? (
											<div className='p-4 text-center text-gray-500 border rounded-lg border-dashed'>
												No se encontraron resultados para "{activeSearchField === 'name' ? searchName : searchIdentification}"
											</div>
										) : (
											peopleData.data?.data?.items?.map(person => (
												<BasicResultsCard
													key={person.id}
													title={person.fullName}
													paragraph={`${person.identificationType?.description || 'DNI'}: ${person.identification}`}
													leftBlockClass='flex items-center justify-start gap-4'
													onSelect={() => handleSelectPerson(person)}
												/>
											))
										)}
									</div>
								</div>
							)}
						</div>
					) : (
						<SelectedPersonCard person={selectedPerson} onRemove={handleRemovePerson} showEmail={false} />
					)}
				</CardContent>
			</Card>
		</>
	);
};

