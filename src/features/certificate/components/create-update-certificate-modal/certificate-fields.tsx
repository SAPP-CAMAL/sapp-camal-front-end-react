import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAllOrigins } from '@/features/origin/hooks';
import { DatePicker } from '@/components/ui/date-picker';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { parseISO, format } from 'date-fns';

export const CertificateFields = () => {
	const form = useFormContext();

	const query = useAllOrigins();

	const origins = query.data.data;

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
		</>
	);
};
