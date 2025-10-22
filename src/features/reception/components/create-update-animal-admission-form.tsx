import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { SearchIntroducersInput } from '@/features/introducer/components';
import { AlertCircle, Check, CircleQuestionMark, Info, Save, XIcon } from 'lucide-react';
import { BasicResultsCard } from './basic-results-card';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useCreateUpdateAnimalAdmission } from '../hooks';
import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { AnimalAdmissionForm } from '../hooks/use-create-update-animal-admission';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QuantitySelector } from '@/components/quantity-selector';
import { toCapitalize } from '@/lib/toCapitalize';
import { SPECIES_CODE } from '@/features/specie/constants';

interface Props {
	className?: string;
	onRemove?: () => void;
	onSave?: (animalAdmission?: AnimalAdmissionForm) => void;
	animalAdmissionData: Partial<AnimalAdmissionForm>;
}

export const CreateUpdateAnimalAdmissionForm = ({ animalAdmissionData, className = 'space-y-4', onSave, onRemove }: Props) => {
	const {
		form,
		brands,
		searchParams,
		brandsQuery,
		showBrandsList,
		corralTypes,
		isQuantitiesLessThan1,
		isQuantityExceeds,
		isInvalidBrand,
		btnMessage,
		corralTypesQuery,
		showEmptyBrandsAlert,
		isEmergencyCorral,
		selectedSpecie,
		showLoadingBrands,
		femaleProductiveStage,
		maleProductiveStage,
		productiveStagesQuery,
		isNormalCorral,
		finishTypes,
		finishTypeQuery,

		// actions
		debounceIntroducerName,
		debounceIntroducerIdentification,
		debounceIntroducerBrand,

		handleSetDate,
		handleSearchCorrals,
		handleSearchCorralGroups,
		handleSaveOrUpdateAnimalAdmission,
		handleUpdateSelectedProductiveStages,
	} = useCreateUpdateAnimalAdmission({ animalAdmissionData, onSave });

	const selectedCorralGroups = form.watch('corralGroups');
	const selectedCorralGroup = form.watch('corralGroup');
	const selectedBrand = form.watch('brand');
	const corrals = form.watch('corrals');
	const selectedCorralType = form.watch('corralType');
	const selectedCorral = form.watch('corral');
	const selectedDate = form.watch('date');
	const selectedFinishType = form.watch('finishType');

	return (
		<Card className='border border-l-4 border-l-blue-500'>
			<CardHeader>
				<CardTitle>{animalAdmissionData.id ? `Ingreso #${animalAdmissionData.id}` : 'Nuevo ingreso'}</CardTitle>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form
						onSubmit={e => {
							e.preventDefault();
							e.stopPropagation();
							form.handleSubmit(handleSaveOrUpdateAnimalAdmission)(e);
						}}
						className={className}
					>
						{/* Introductor */}
						<div className='space-y-2'>
							<Label>
								Introductor
								<span className='text-red-500'>*</span>
							</Label>

							{/* Introducers list search*/}
							{!selectedBrand && (
								<SearchIntroducersInput
									brand={{
										defaultValue: searchParams.introducerBrand,
										onChange: debounceIntroducerBrand,
									}}
									fullName={{
										defaultValue: searchParams.introducerName,
										onChange: debounceIntroducerName,
									}}
									identification={{
										defaultValue: searchParams.introducerIdentification,
										onChange: debounceIntroducerIdentification,
									}}
									showLabel={false}
									showInputIcon
									disabled={brandsQuery.isLoading || !selectedSpecie}
								/>
							)}

							{/* Introducers alert */}
							{isInvalidBrand && <p className='text-sm text-red-500'>Seleccione una marca para continuar</p>}

							{selectedBrand && (
								<BasicResultsCard
									key={selectedBrand.id}
									leftBlockClass='flex items-center justify-start gap-2'
									title={selectedBrand.introducer.name}
									paragraph={`${selectedBrand.introducer.identification} • ${selectedBrand.name}`}
									onRemove={() => form.setValue('brand', undefined)}
									// editButton={
									// 	<Button variant='outline' >
									// 		<Edit />
									// 		Editar
									// 	</Button>
									// }
									isSelected
								/>
							)}

							{showLoadingBrands && <BasicResultsCard leftBlockClass='flex items-center justify-start gap-2' title='Cargando marcas...' />}
							{showEmptyBrandsAlert && (
								<BasicResultsCard
									leftBlockClass='flex items-center justify-start gap-2'
									title='No se encontraron marcas registradas para la especie seleccionada.'
								/>
							)}

							{/* Introducers/Brands list */}
							<div className='grid gap-2 max-h-48 overflow-y-auto'>
								{showBrandsList &&
									brands?.map(brand => (
										<BasicResultsCard
											key={brand.id}
											leftBlockClass='flex items-center justify-start gap-2'
											title={brand.introducer.name}
											paragraph={`${brand.introducer.identification} • ${brand.name}`}
											onSelect={() => form.setValue('brand', brand)}
										/>
									))}
							</div>
						</div>

						{/* Date and quantity */}
						<div className='grid md:grid-cols-2 gap-4'>
							<div className='space-y-2'>
								<FormField
									control={form.control}
									name='date'
									// rules={{ required: { value: true, message: 'Seleccione una fecha' } }}
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												Fecha de Faenamiento
												{/* Tooltip */}
												<Tooltip>
													<TooltipTrigger asChild>
														<CircleQuestionMark className='w-4 h-4 cursor-help' />
													</TooltipTrigger>
													<TooltipContent side='top' align='center'>
														<div className='text-sm'>
															La fecha de faenamiento se asigna de la siguiente manera:
															<br />
															<br />- La <strong>fecha actual</strong>, si el tipo de corral es <strong>Emergencia</strong>
															<br />- La <strong>fecha del siguiente día</strong>, si el tipo de corral es: <strong>Normal,</strong>
															<br />
															<strong>Embudo o Cuarentena.</strong>
														</div>
													</TooltipContent>
												</Tooltip>
											</FormLabel>
											<DatePicker
												selected={selectedDate ? new Date(selectedDate) : null}
												onChange={date => field.onChange(date?.toISOString())}
												disabled
											/>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
							<div className='space-y-2'>
								<Label>
									Cantidad
									<Tooltip>
										<TooltipTrigger asChild>
											<CircleQuestionMark className='w-4 h-4 cursor-help' />
										</TooltipTrigger>
										<TooltipContent side='top' align='center'>
											<div className='text-base'>
												La de hembras o machos se irá sumando automáticamente
												<br />
												según las etapas productivas que ingrese más abajo.
											</div>
										</TooltipContent>
									</Tooltip>
								</Label>

								<div className='flex gap-2'>
									<FormField
										control={form.control}
										name='females'
										rules={{
											min: { value: 0, message: 'La cantidad no puede ser negativa' },
										}}
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<div className='flex items-center gap-1 flex-1 text-pink-700 font-semibold'>
														H
														<Input
															className='bg-pink-100 rounded-lg border border-pink-300 text-pink-700 font-bold'
															type='number'
															placeholder='0'
															min={0}
															onWheel={e => e.currentTarget.blur()} // prevent number input change on wheel
															disabled
															{...field}
														/>
													</div>
												</FormControl>

												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name='males'
										rules={{
											min: { value: 0, message: 'La cantidad no puede ser negativa' },
										}}
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<div className='flex items-center gap-1 flex-1 text-blue-700 font-semibold'>
														M
														<Input
															className='border-blue-200 bg-gradient-to-br from-blue-50 via-white to-blue-50 text-blue-700 font-bold'
															type='number'
															placeholder='0'
															min={0}
															onWheel={e => e.currentTarget.blur()} // prevent number input change on wheel
															disabled
															{...field}
														/>
													</div>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								{isQuantitiesLessThan1 && <p className='text-sm text-red-500'>Ingrese al menos una cantidad de hembras o machos</p>}
								{isQuantityExceeds && <p className='text-sm text-red-500'>La cantidad total excede la cantidad registrada en el certificado</p>}
							</div>
						</div>

						{/* Productive stages values */}
						<div className='grid md:grid-cols-2 gap-4'>
							{/* Females */}
							<div className='flex flex-col gap-2'>
								<Label>
									Etapa productiva para hembras
									<Tooltip>
										<TooltipTrigger asChild>
											<CircleQuestionMark className='w-4 h-4 cursor-help' />
										</TooltipTrigger>
										<TooltipContent side='top' align='center'>
											Se muestra el listado de las etapas productivas para hembras de la especie seleccionada.
										</TooltipContent>
									</Tooltip>
								</Label>

								<div className='flex flex-col gap-2'>
									{femaleProductiveStage.map(stage => (
										<QuantitySelector
											key={stage.id}
											title={stage.name}
											className={cn(
												'bg-pink-50 rounded-lg border border-pink-200',
												isQuantityExceeds && (stage.quantity ?? 0) > 0 ? 'border border-red-500' : ''
											)}
											titleClassName='text-pink-700'
											quantity={stage.quantity ?? 0}
											onQuantityChanged={quantity => handleUpdateSelectedProductiveStages(stage.id, quantity)}
										/>
									))}
								</div>
							</div>

							{/* Males */}
							<div className='flex flex-col gap-2'>
								<Label>
									Etapa productiva para machos
									<Tooltip>
										<TooltipTrigger asChild>
											<CircleQuestionMark className='w-4 h-4 cursor-help' />
										</TooltipTrigger>
										<TooltipContent side='top' align='center'>
											Se muestra el listado de las etapas productivas para machos de la especie seleccionada.
										</TooltipContent>
									</Tooltip>
								</Label>
								<div className='flex flex-col gap-2'>
									{maleProductiveStage.map(stage => (
										<QuantitySelector
											key={stage.id}
											title={stage.name}
											className={cn(
												'border-blue-200 bg-gradient-to-br from-blue-50 via-white to-blue-50',
												isQuantityExceeds && (stage.quantity ?? 0) > 0 ? 'border border-red-500' : ''
											)}
											titleClassName='text-blue-700'
											quantity={stage.quantity ?? 0}
											onQuantityChanged={quantity => handleUpdateSelectedProductiveStages(stage.id, quantity)}
										/>
									))}
								</div>
							</div>
							{productiveStagesQuery.isFetching && (
								<span className='text-sm text-muted-foreground mt-2'>Cargando listado de etapas productivas...</span>
							)}
						</div>

						{/* Corral Types and corral groups */}
						<div className='grid md:grid-cols-2 gap-4'>
							{/* corral types */}
							<div className='flex flex-col gap-2'>
								<FormField
									control={form.control}
									name='corralType'
									rules={{ required: { value: true, message: 'Tipo de corral es requerido' } }}
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												Tipo de corral
												{/* Tooltip */}
												<Tooltip>
													<TooltipTrigger asChild>
														<CircleQuestionMark className='w-4 h-4 cursor-help' />
													</TooltipTrigger>
													<TooltipContent side='top' align='center'>
														<div className='text-sm'>
															{/* Se muestran todos los tipos de corrales disponibles. */}
															Selección de tipo de corral: <br />
															<br />
															<b>Normal:</b> Al seleccionar normal, se mostrará la
															<br />
															agrupaciones de corrales.
															{/* Depilado o Chamuscado
															<br />
															en el caso de <strong>Porcinos</strong> y Local o Guayaquil
															<br />
															para las de mas especies. */}
															<br />
															<br />
															<b>Emergencia, Embudo y Cuarentena:</b> Al elegir alguno de <br />
															estos tipos de corrales, se habilita los <strong>Corrales Especiales.</strong>
															<br />
															<br />
															En el caso de la especie <strong>Porcino</strong>, cuando se elige <strong>Corrales</strong>
															<br />
															<strong>Especiales</strong> también deberá especificar el <strong>tipo de acabado</strong>
															<br />
															del animal <strong>(Depilado o Chamuscado)</strong>.
															<br />
															<br />
														</div>
													</TooltipContent>
												</Tooltip>
											</FormLabel>
											<FormControl>
												<div className='grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-center justify-between gap-8'>
													{corralTypes.map(option => (
														<Label key={option.id} className='flex items-center gap-2'>
															<Checkbox
																checked={selectedCorralType?.id === option.id}
																onCheckedChange={async checked => {
																	if (checked) field.onChange(option);
																	handleSetDate();
																	await handleSearchCorralGroups();
																}}
															/>
															{toCapitalize(option.description)}
														</Label>
													))}
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								{corralTypesQuery.isFetching && <span className='text-sm text-muted-foreground mt-2'>Cargando tipos de corral...</span>}
							</div>

							{/* Corral Groups */}
							{(!selectedSpecie?.name.toLowerCase().startsWith(SPECIES_CODE.PORCINO.toLowerCase()) ||
								(selectedCorralGroups?.length !== 1 && isNormalCorral)) && (
								<div className='flex flex-col gap-2'>
									<FormField
										control={form.control}
										name='corralGroup'
										rules={{ required: { value: true, message: 'La agrupación de corrales es requerida' } }}
										render={({ field }) => (
											<FormItem>
												<FormLabel>
													Agrupación de corrales
													{/* Tooltip */}
													<Tooltip>
														<TooltipTrigger asChild>
															<CircleQuestionMark className='w-4 h-4 cursor-help' />
														</TooltipTrigger>
														<TooltipContent side='top' align='center'>
															<div className='text-sm'>
																Se muestran todas las agrupaciones de corrales
																<br />
																disponibles para la especie y tipo de corral seleccionado.
															</div>
														</TooltipContent>
													</Tooltip>
												</FormLabel>
												<FormControl>
													<div className='grid grid-cols-2 lg:grid-cols-3 items-center justify-between gap-8'>
														{selectedCorralGroups ? (
															selectedCorralGroups.length < 1 ? (
																<>
																	{form.watch('isLoadingCorralGroups') ? (
																		<div className='col-span-2 lg:col-span-3'>
																			<span className='text-sm text-muted-foreground'>Cargando agrupamientos...</span>
																		</div>
																	) : (
																		<span className='text-sm text-muted-foreground col-span-2 lg:col-span-3'>No hay agrupamientos disponibles</span>
																	)}
																</>
															) : (
																selectedCorralGroups.map(corral => (
																	<Label key={corral.id}>
																		<Checkbox
																			checked={selectedCorralGroup?.id === corral.id}
																			onCheckedChange={async () => {
																				field.onChange(corral);
																				await handleSearchCorrals();
																			}}
																		/>
																		{toCapitalize(corral.name)}
																	</Label>
																))
															)
														) : (
															<span className='text-sm text-muted-foreground col-span-2 lg:col-span-3'>
																Seleccione una especie para cargar los agrupamientos
															</span>
														)}
													</div>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							)}

							{/* Finish Type */}
							{selectedSpecie?.name.toLowerCase().startsWith(SPECIES_CODE.PORCINO.toLowerCase()) &&
								isNormalCorral !== undefined &&
								!isNormalCorral && (
									<div className='flex flex-col gap-2'>
										<FormField
											control={form.control}
											name='finishType'
											rules={{ required: { value: true, message: 'El tipo de acabado es requerido' } }}
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														Tipo de acabado
														{/* Tooltip */}
														<Tooltip>
															<TooltipTrigger asChild>
																<CircleQuestionMark className='w-4 h-4 cursor-help' />
															</TooltipTrigger>
															<TooltipContent side='top' align='center'>
																<div className='text-sm'>
																	Se muestran todos los tipos de acabado.
																	{/* <br />
																	unicamente para la especie <strong>Porcino</strong>
																	<br />y los tipos de corral: <strong>Emergencia, Embudo</strong> <br />
																	<strong>y Cuarentena.</strong> */}
																</div>
															</TooltipContent>
														</Tooltip>
													</FormLabel>
													<FormControl>
														<div className='grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-center justify-between gap-8'>
															{finishTypes.length > 0 ? (
																finishTypes.map(type => (
																	<Label key={type.id}>
																		<Checkbox checked={selectedFinishType?.id === type.id} onCheckedChange={() => field.onChange(type)} />
																		{type.name}
																	</Label>
																))
															) : (
																<span className='text-sm text-muted-foreground col-span-2 lg:col-span-3'>No hay tipos de acabado disponibles</span>
															)}
														</div>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										{finishTypeQuery.isFetching && <span className='text-sm text-muted-foreground mt-2'>Cargando tipos de acabado...</span>}
									</div>
								)}

							{isEmergencyCorral && (
								<div className='flex items-center gap-2 text-sm text-red-500 mt-2 md:col-span-2'>
									<AlertCircle className='w-4 h-4' />
									<span className='font-normal'>Cuando registre el ingreso como emergencia ya no podrá editar ni borrar el registro.</span>
								</div>
							)}
						</div>

						{/* Corrals */}
						<div className='space-y-2'>
							{/* Corrals */}
							<FormField
								control={form.control}
								name='corral'
								rules={{ required: { value: true, message: 'Seleccione un corral' } }}
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Corrales
											<span className='text-red-500'>*</span>
											<Tooltip>
												<TooltipTrigger asChild>
													<Info className='w-4 h-4' />
												</TooltipTrigger>
												<TooltipContent side='top' align='center'>
													Se muestran todos los corrales disponibles
													<br />
													por la especie, tipo de corral y agrupación seleccionada.
												</TooltipContent>
											</Tooltip>
										</FormLabel>
										<Select
											name='corral'
											value={selectedCorral?.id?.toString() ?? ''}
											onValueChange={value => {
												field.onChange(corrals?.find(s => +s.id === +value));
											}}
											disabled={corrals?.length === 0}
										>
											<FormControl>
												<SelectTrigger className='w-full bg-secondary'>
													<SelectValue placeholder={corrals?.length === 0 ? 'No hay corrales disponibles' : 'Seleccione un corral'} />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{(corrals?.length || 0) > 0 ? (
													corrals?.map(corral => (
														<SelectItem key={corral.id} value={String(corral.id)} disabled={corral.closeCorral}>
															{corral.name} - {corral.closeCorral ? 'No disponible' : 'Disponible'}
														</SelectItem>
													))
												) : (
													<SelectItem value='none' disabled>
														No hay corrales disponibles
													</SelectItem>
												)}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							{form.watch('isLoadingCorrals') && <p className='text-sm text-muted-foreground mt-1'>Cargando corrales...</p>}
						</div>

						{/* Observations */}
						<div className='space-y-2'>
							<FormField
								control={form.control}
								name='observations'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Observación</FormLabel>
										<FormControl>
											<Textarea className='bg-secondary' placeholder='Observaciones adicionales...' {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{/* Save or cancel buttons */}
						<div className='flex gap-2'>
							<ConfirmationDialog
								title={`¿Esta seguro que desea ${animalAdmissionData.id ? 'actualizar' : 'crear'} este registro?`}
								description={`Esta acción registrará el ingreso de los animales en el sistema, pero ${
									isEmergencyCorral
										? 'no se podrá editar ni eliminar el registro porque es de tipo emergencia.'
										: 'podrá editar o eliminar el registro más tarde.'
								}`}
								onConfirm={form.handleSubmit(handleSaveOrUpdateAnimalAdmission)}
								triggerBtn={
									<Button
										variant='ghost'
										className='bg-primary hover:bg-primary hover:text-white text-white'
										disabled={form.formState.isSubmitting}
									>
										<Save />
										{btnMessage}
									</Button>
								}
								cancelBtn={
									<Button variant='outline' size='lg'>
										<XIcon />
										No
									</Button>
								}
								confirmBtn={
									<Button variant='ghost' className='bg-emerald-600 hover:bg-emerald-600 hover:text-white text-white' size='lg'>
										<Check />
										Si
									</Button>
								}
							/>

							<Button type='button' variant='outline' onClick={onRemove}>
								{animalAdmissionData.id ? 'Cerrar' : 'Cancelar'}
							</Button>
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
};
