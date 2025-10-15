'use client';

import { Plus, Save, Search, XIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toCapitalize } from '@/lib/toCapitalize';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useRegisterDisinfectantData } from '@/features/disinfectant/hooks';
import { ShipperDataCard } from '@/features/shipping/components/shipper-data-card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { SearchShippersInput, ShipperListCard, ShipperModal } from '@/features/shipping/components';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BasicResultsCard } from '@/features/reception/components';

export function RegisterDisinfectantDataForm() {
	const {
		form,
		species,
		shippers,
		isEditing,
		btnValue,
		disinfectants,
		selectedShipper,
		showShippersList,
		isSpeciesLoading,
		isShippersLoading,
		addShipper,
		addVehicle,
		selectedCertificatePlate,
		showCreateShippingFromSomeFields,
		handleSetShipper,
		handleSearchFields,
		handleRemoveSelected,
		handleRegisterDisinfectantData,
	} = useRegisterDisinfectantData();

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(handleRegisterDisinfectantData)}>
				<div className='px-2 py-4 flex justify-between items-center'>
					<h2 className='text-lg'>Datos de Desinfección</h2>
				</div>

				{/* Is Editing */}
				{/* {isEditing && (
					<div className='p-3 bg-blue-50 border border-blue-200 rounded-lg'>
						<div className='flex items-center justify-between'>
							<div className='flex items-center gap-2 text-blue-900'>
								<span className='text-sm font-medium'>Editando registro</span>
							</div>
							<Button variant='ghost' className='bg-blue-50 text-blue-900 hover:text-blue-700 hover:bg-gray-200' onClick={handleRemoveSelected}>
								<XIcon />
							</Button>
						</div>
						<p className='text-xs text-blue-700 mt-1'>
							Modifica los campos necesarios y haz clic en &quot;Actualizar Registro&quot; para guardar los cambios.
						</p>
					</div>
				)} */}

				{/* Vehicle/Shipper Selection */}
				<div className='px-2 py-4'>
					{/* Create New Shipper Modal */}
					<div className='flex items-center justify-between mb-4'>
						<label className='flex items-center gap-2'>
							<Search className='w-5 h-5' />
							Seleccionar Vehículo/Transportista
						</label>

						<ShipperModal
							key={form.watch('plate') + form.watch('fullName') + form.watch('identification')}
							shipperData={{
								plate: form.watch('plate') || '',
								firstName: form.watch('fullName') || '',
								identification: form.watch('identification') || '',
							}}
							onSetShipper={handleSetShipper}
							triggerButton={
								<Button>
									<Plus />
									Crear Nuevo
								</Button>
							}
						/>
					</div>

					<ShipperDataCard shipper={selectedShipper} onSetShipper={handleSetShipper} addShipper={addShipper} addVehicle={addVehicle} />

					{/* Search shippers input */}
					{!selectedShipper && (
						<SearchShippersInput
							className='grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-2'
							fullName={{
								value: form.watch('fullName'),
								onChange: (text: string) => handleSearchFields('fullName', text),
							}}
							identification={{
								value: form.watch('identification'),
								onChange: (text: string) => handleSearchFields('identification', text),
							}}
							plate={{
								value: selectedCertificatePlate || form.watch('plate'),
								onChange: (text: string) => handleSearchFields('plate', text),
							}}
						/>
					)}

					{isShippersLoading && <BasicResultsCard className='text-sm' title='Buscando transportistas...' />}

					{/* Shippers list */}
					{showShippersList && <ShipperListCard onSelectShipper={handleSetShipper} shippers={shippers} />}

					{showCreateShippingFromSomeFields && (
						<BasicResultsCard className='text-sm' title='No se encontraron transportistas con el nombre, identificación o placa proporcionados.' />
					)}

					{form.watch('showShipperAlert') && <p className='text-destructive text-sm mt-4'>Por favor seleccione un transportista</p>}
				</div>

				<hr className='my-2' />

				{/* Transported species */}
				<div className='px-2 py-4'>
					<FormField
						control={form.control}
						name='transportedSpecie'
						rules={{ required: { value: true, message: 'Las especie a transportar es requerido' } }}
						render={({ field }) => (
							<FormItem>
								<FormLabel>Especies Transportadas</FormLabel>
								<FormControl>
									<div className='grid grid-cols-2 md:grid-cols-4 items-center justify-between gap-8'>
										{species.map(option => (
											<Label key={option.id} className='flex items-center gap-2'>
												<Checkbox
													checked={field.value === option.id}
													onCheckedChange={checked => {
														if (checked) field.onChange(option.id);
													}}
												/>
												{toCapitalize(option.name)}
											</Label>
										))}

										{isSpeciesLoading && <span className='text-sm col-span-2'>Cargando especies...</span>}
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<hr className='my-2' />

				{/* Disinfectant name and dosage */}
				<div className='px-2 py-4 grid grid-cols-1 md:grid-cols-2 gap-4'>
					{/* disinfectant */}
					<FormField
						control={form.control}
						name='disinfectant'
						rules={{ required: { value: true, message: 'El nombre del desinfectante es requerido' } }}
						render={({ field }) => (
							<FormItem>
								<FormLabel>Nombre del Desinfectante</FormLabel>
								<Select name='disinfectant' value={field.value} onValueChange={value => field.onChange(value)}>
									<FormControl>
										<SelectTrigger className='w-full bg-secondary'>
											<SelectValue placeholder='Seleccione un desinfectante' />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{disinfectants.map(disinfectant => (
											<SelectItem key={disinfectant.id} value={String(disinfectant.id)}>
												{disinfectant.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* dosage */}
					<FormField
						control={form.control}
						name='dosage'
						rules={{ required: { value: true, message: 'La dosis es requerido' } }}
						render={({ field }) => (
							<FormItem>
								<FormLabel>Dosificación</FormLabel>
								<FormControl>
									<Input placeholder='Ej: 40ml' className='bg-secondary' {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				{/* Application times */}
				<div className='px-2 py-4 grid grid-cols-1 md:grid-cols-2 gap-4'>
					{/* admissionApplicationTime */}
					<FormField
						control={form.control}
						name='admissionApplicationTime'
						rules={{ required: { value: true, message: 'La hora de aplicación de ingreso es requerido' } }}
						render={({ field }) => (
							<FormItem>
								<FormLabel>Hora de Aplicación de Ingreso</FormLabel>
								<FormControl>
									<Input className='bg-secondary' type='time' {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* departureApplicationTime */}
					<FormField
						control={form.control}
						name='departureApplicationTime'
						rules={{
							// required: { value: true, message: 'La hora de aplicación de salida es requerido' },
							validate: {
								isAfterAdmission: value => {
									const admissionTime = form.getValues('admissionApplicationTime');
									if (!admissionTime || !value) return true; // Si no hay valores, no validar

									return value > admissionTime || 'La hora de salida debe ser posterior a la hora de ingreso';
								},
							},
						}}
						render={({ field }) => (
							<FormItem>
								<FormLabel>Hora de Aplicación de Salida</FormLabel>
								<FormControl>
									<Input className='bg-secondary' type='time' {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				{/* observations */}
				<div className='px-2 py-4'>
					<FormField
						control={form.control}
						name='observations'
						render={({ field }) => (
							<FormItem>
								<FormLabel>Observaciones</FormLabel>
								<FormControl>
									<Textarea className='bg-secondary' placeholder='Observaciones adicionales...' {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<div className='px-2 py-4 flex justify-end'>
					<div className='space-x-2'>
						{isEditing && (
							<Button type='button' variant='outline' onClick={handleRemoveSelected}>
								<XIcon />
								Cancelar
							</Button>
						)}
						<Button type='submit' disabled={form.formState.isSubmitting}>
							<Save />
							{btnValue}
						</Button>
					</div>
				</div>
			</form>
		</Form>
	);
}
