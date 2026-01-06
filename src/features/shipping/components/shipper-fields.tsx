import { Ring2 } from 'ldrs/react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { useCatalogue } from '@/features/catalogues/hooks/use-catalogue';
import { validateDocumentTypeService } from '@/features/people/server/db/people.service';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import 'ldrs/react/Ring2.css';

export const ShipperFields = () => {
	const form = useFormContext();

	const catalogueVehicleTypes = useCatalogue('TVH');
	const catalogueIdentityTypes = useCatalogue('TID');
	const catalogueTransportTypes = useCatalogue('TTR');

	const isRetrievingPersonData = form.watch('isRetrievingPersonData') as boolean;

	return (
		<>
			{/* identificationTypeId */}
			<FormField
				control={form.control}
				name='identificationTypeId'
				rules={{ required: { value: true, message: 'El tipo de identificación es requerido' } }}
				render={({ field }) => (
					<FormItem>
						<FormLabel>Tipo de Identificación</FormLabel>
						<Select
							name='identificationTypeId'
							defaultValue={field.value}
							onValueChange={value => {
								field.onChange(value);
								form.setValue('identification', '');
							}}
						>
							<FormControl>
								<SelectTrigger className='w-full bg-secondary'>
									<SelectValue placeholder='Seleccione un tipo de identificación' />
								</SelectTrigger>
							</FormControl>
							<SelectContent>
								{catalogueIdentityTypes.data?.data.map((identityType, index) => (
									<SelectItem key={index} value={String(identityType.catalogueId)}>
										{identityType.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<FormMessage />
					</FormItem>
				)}
			/>

			{/* identification */}
			<FormField
				control={form.control}
				name='identification'
				rules={{
					required: { value: true, message: 'El número de documento es requerido' },
					validate: {
						validateDocumentTypeService: async (value, formData) => {
							const currentValue = catalogueIdentityTypes?.data?.data.find(data => data.catalogueId === Number(formData.identificationTypeId));

							const isCedula = currentValue?.code === 'CED';
							const isRUCJ = currentValue?.code === 'RUCJ';
							const isRUCN = currentValue?.code === 'RUCN';

							if (!currentValue) return false;

							if (isCedula && value.length !== 10) return 'El número de documento debe tener 10 caracteres';

							if (isRUCJ && value.length !== 13) return 'El número de documento debe tener 13 caracteres';

							if (isRUCN && value.length !== 13) return 'El número de documento debe tener 13 caracteres';

							try {
								const response = await validateDocumentTypeService(currentValue.code, value);
								return !!response?.data?.isValid;
							} catch (error: any) {
								const { message } = await error.response.json();
								return message;
							}
						},
					},
				}}
				render={({ field }) => (
					<FormItem>
						<FormLabel>Identificación</FormLabel>
						<FormControl>
							<Input className='bg-secondary' placeholder='Ingrese el número de identificación' {...field} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			{/* firstName */}
			<FormField
				control={form.control}
				name='firstName'
				rules={{ required: { value: true, message: 'El nombre es requerido' } }}
				render={({ field }) => (
					<FormItem>
						<FormLabel>
							Nombre {isRetrievingPersonData && <Ring2 size='15' stroke='3' strokeLength='0.25' bgOpacity='0.1' speed='0.8' color='black' />}
						</FormLabel>
						<FormControl>
							<Input className='bg-secondary' placeholder='Ingrese el nombre' {...field} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			{/* lastName */}
			<FormField
				control={form.control}
				name='lastName'
				rules={{ required: { value: true, message: 'El apellido es requerido' } }}
				render={({ field }) => (
					<FormItem>
						<FormLabel>
							Apellido {isRetrievingPersonData && <Ring2 size='15' stroke='3' strokeLength='0.25' bgOpacity='0.1' speed='0.8' color='black' />}
						</FormLabel>
						<FormControl>
							<Input className='bg-secondary' placeholder='Ingrese el apellido' {...field} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			{/* plate */}
			<FormField
				control={form.control}
				name='plate'
				rules={{ required: { value: true, message: 'La placa del vehículo es requerido' } }}
				render={({ field }) => (
					<FormItem>
						<FormLabel>Placa</FormLabel>
						<FormControl>
							<Input className='bg-secondary' placeholder='Ingrese la placa del vehículo' {...field} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			{/* vehicleTypeId */}
			<FormField
				control={form.control}
				name='vehicleTypeId'
				rules={{ required: { value: true, message: 'El tipo de vehículo es requerido' } }}
				render={({ field }) => (
					<FormItem>
						<FormLabel>Tipo de Vehículo</FormLabel>
						<Select name='vehicleTypeId' defaultValue={field.value} onValueChange={field.onChange}>
							<FormControl>
								<SelectTrigger className='w-full bg-secondary'>
									<SelectValue placeholder='Seleccione un tipo de vehículo' />
								</SelectTrigger>
							</FormControl>
							<SelectContent>
								{catalogueVehicleTypes.data?.data.map((vehicleType, index) => (
									<SelectItem key={index} value={String(vehicleType.catalogueId)}>
										{vehicleType.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<FormMessage />
					</FormItem>
				)}
			/>

			{/* transportTypeId */}
			<FormField
				control={form.control}
				name='transportTypeId'
				rules={{ required: { value: true, message: 'El tipo de transporte es requerido' } }}
				render={({ field }) => (
					<FormItem>
						<FormLabel>Tipo de Transporte</FormLabel>
						<Select name='transportTypeId' defaultValue={field.value} onValueChange={field.onChange}>
							<FormControl>
								<SelectTrigger className='w-full bg-secondary'>
									<SelectValue placeholder='Seleccione un tipo de transporte' />
								</SelectTrigger>
							</FormControl>
							<SelectContent>
								{catalogueTransportTypes.data?.data.map((transportType, index) => (
									<SelectItem key={index} value={String(transportType.catalogueId)}>
										{transportType.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<FormMessage />
					</FormItem>
				)}
			/>
		</>
	);
};
