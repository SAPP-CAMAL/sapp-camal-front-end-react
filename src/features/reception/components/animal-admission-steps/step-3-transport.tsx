import { Check, Save, XIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ACCORDION_NAMES } from '../../constants';
import { useStep3Transport } from '../../hooks';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { AccordionContent, AccordionItem } from '@/components/ui/accordion';
import { BasicAnimalAdmissionAccordionHeader } from '../basic-animal-admission-accordion-header';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ConfirmationDialog } from '@/components/confirmation-dialog';

export const Step3Transport = () => {
	const { step3Accordion, form, bedTypes, arrivalConditions, handleChangeStep3, handleSaveTransport } = useStep3Transport();

	return (
		<AccordionItem value={ACCORDION_NAMES.STEP_3} className='border rounded-lg'>
			{/*  Accordion header*/}
			<BasicAnimalAdmissionAccordionHeader
				stepNumber={3}
				title='Condiciones de transporte'
				isDisabled={step3Accordion.state === 'disabled'}
				isDisabledMessage='Debe completar el paso 1 para continuar'
				onClick={handleChangeStep3}
				variant={step3Accordion.state === 'completed' ? 'success' : 'default'}
			/>

			<AccordionContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleSaveTransport)} className='p-4 space-y-4'>
						<FormField
							control={form.control}
							name='bedTypeId'
							rules={{ required: { value: true, message: 'El tipo de cama es requerido' } }}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Tipo de cama</FormLabel>
									<FormControl>
										<div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
											{bedTypes.length < 1 ? (
												<span className='text-sm text-muted-foreground '>No hay camas disponibles</span>
											) : (
												bedTypes.map(bed => (
													<div key={bed.id} className='flex items-center space-x-2'>
														<Label>
															<Checkbox
																checked={field.value === bed.id}
																onCheckedChange={checked => {
																	if (checked) field.onChange(bed.id);
																}}
															/>
															{bed.description}
														</Label>
													</div>
												))
											)}
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name='arrivalConditionId'
							rules={{ required: { value: true, message: 'La condición de arribo es requerida' } }}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Condiciones de arribo</FormLabel>
									<FormControl>
										<div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
											{arrivalConditions.length < 1 ? (
												<span className='text-sm text-muted-foreground '>No hay condiciones de arribo disponibles</span>
											) : (
												arrivalConditions.map(condition => (
													<div key={condition.id} className='flex items-center space-x-2'>
														<Label>
															<Checkbox
																checked={field.value === condition.id}
																onCheckedChange={checked => {
																	if (checked) field.onChange(condition.id);
																}}
															/>
															{condition.description}
														</Label>
													</div>
												))
											)}
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Propio medio */}
						<FormField
							control={form.control}
							name='ownMedium'
							rules={{ required: { value: true, message: 'La condición de arribo es requerida' } }}
							render={({ field }) => (
								<FormItem>
									<FormLabel> ¿Se moviliza por propio medio?</FormLabel>
									<FormControl>
										<div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
											{['Si', 'No'].map(option => (
												<div key={option} className='flex items-center space-x-2'>
													<Label>
														<Checkbox
															checked={field.value === option.toLowerCase()}
															onCheckedChange={checked => {
																if (checked) field.onChange(option.toLowerCase());
															}}
														/>
														{option}
													</Label>
												</div>
											))}
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Observaciones */}
						<FormField
							control={form.control}
							name='commentary'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Observaciones (opcional)</FormLabel>
									<FormControl>
										<Textarea
											placeholder='Ingrese observaciones adicionales sobre las condiciones de transporte...'
											className='min-h-[100px] resize-none'
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className='flex items-center justify-end'>
							<ConfirmationDialog
								title={`¿Esta seguro que desea finalizar el ingreso de animales?`}
								description={`Esta acción completará el ingreso de los animales y se reiniciará el formulario para un nuevo ingreso.`}
								onConfirm={form.handleSubmit(handleSaveTransport)}
								triggerBtn={
									<Button
										variant='ghost'
										className='bg-primary hover:bg-primary hover:text-white text-white'
										type='button'
										disabled={!form.formState.isValid || form.formState.isSubmitting}
									>
										<Save />
										{form.formState.isSubmitting ? 'Guardando...' : 'Completar Condiciones'}
									</Button>
								}
								cancelBtn={
									<Button variant='outline' size='lg'>
										<XIcon />
										Continuar editando
									</Button>
								}
								confirmBtn={
									<Button variant='ghost' className='bg-primary hover:bg-primary hover:text-white text-white' size='lg'>
										<Check />
										Si
									</Button>
								}
							/>
						</div>
					</form>
				</Form>
			</AccordionContent>
		</AccordionItem>
	);
};
