import { Check, Info, Plus, Save, XIcon } from 'lucide-react';
import { AccordionContent, AccordionItem } from '@/components/ui/accordion';
import { BasicAnimalAdmissionAccordionHeader } from '../basic-animal-admission-accordion-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ACCORDION_NAMES } from '../../constants';
import { CreateUpdateAnimalAdmissionForm } from '../create-update-animal-admission-form';
import { BasicAnimalAdmissionInfoCard } from '../basic-animal-admission-info-card';
import { saveNewAnimalAdmissionToLocalStorage, saveSpeciesInLocalStorage } from '../../utils';
import { useStep2Animals } from '../../hooks/use-step-2-animals';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BasicResultsCard } from '../basic-results-card';
import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { toCapitalize } from '@/lib/toCapitalize';

export const Step2Animals = () => {
	const {
		step2Accordion,
		selectedCertificate,
		animalAdmissionList,
		totalAnimals,
		isCompleted,
		selectedSpecie,
		species,
		speciesQuery,

		handleChangeStep2,
		handleAddNewAnimalAdmission,
		handleUpdateAnimalAdmission,
		removeAnimalAdmission,
		handleNextStep3,
		handleSetSelectedSpecie,
		handleResetPage,
	} = useStep2Animals();

	return (
		<AccordionItem value={ACCORDION_NAMES.STEP_2} className='border rounded-lg'>
			{/*  Accordion header*/}
			<BasicAnimalAdmissionAccordionHeader
				stepNumber={2}
				title='Ingreso de animales del certificado'
				isDisabled={step2Accordion.state === 'disabled'}
				isDisabledMessage='Debe completar el paso 1 para continuar'
				variant={step2Accordion.state === 'completed' ? 'success' : 'default'}
				subTitle={`Animales registrados ${totalAnimals} de ${selectedCertificate?.quantity || 0}`}
				onClick={handleChangeStep2}
			/>

			<AccordionContent className='p-4 space-y-4'>
				{/* Select specie */}
				<Label>
					Especie
					<Tooltip>
						<TooltipTrigger asChild>
							<Info className='w-4 h-4' />
						</TooltipTrigger>
						<TooltipContent side='top' align='center'>
							Se muestran todas las especies.
						</TooltipContent>
					</Tooltip>
				</Label>
				<Select
					name='specie'
					value={selectedSpecie?.id.toString() || ''}
					onValueChange={async value => {
						const specie = species.find(s => s.id === +value);
						if (!specie) return;
						handleSetSelectedSpecie(specie);
						saveSpeciesInLocalStorage({ ...specie, certificateId: selectedCertificate?.code || '' });
					}}
					disabled={animalAdmissionList.length > 0}
				>
					<SelectTrigger className='w-full bg-secondary'>
						<SelectValue placeholder='Seleccione una especie' />
					</SelectTrigger>
					<SelectContent>
						{species.map(specie => (
							<SelectItem key={specie.id} value={String(specie.id)}>
								{toCapitalize(specie.name)}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<div className='flex justify-between items-center'>
					<span />

					<Button onClick={handleAddNewAnimalAdmission} disabled={isCompleted || !selectedSpecie}>
						<Plus />
						Crear Nuevo
					</Button>
				</div>

				{speciesQuery.isFetching && !selectedSpecie && (
					<BasicResultsCard leftBlockClass='flex items-center justify-start gap-2' title='Cargando especies...' />
				)}

				{animalAdmissionList.length < 1 && (
					<div className='text-center py-8 text-muted-foreground'>
						No hay ingresos registrados. {!selectedSpecie ? 'Seleccione una especie' : 'Haga clic en "Agregar Ingreso"'} para comenzar.
					</div>
				)}

				{/* Form cards */}
				{animalAdmissionList.map(admission => (
					<div key={admission.randomId + admission.animalAdmission.id} className='space-y-2'>
						{admission.isOpen ? (
							<CreateUpdateAnimalAdmissionForm
								animalAdmissionData={admission.animalAdmission}
								onSave={data => {
									const admissionData = {
										randomId: admission.randomId,
										animalAdmission: { ...admission.animalAdmission, ...data },
										state: 'updated' as const,
										isOpen: false,
									};

									handleUpdateAnimalAdmission(admissionData);

									saveNewAnimalAdmissionToLocalStorage({ ...admissionData, certificateId: selectedCertificate?.code || '' });
								}}
								onRemove={() => {
									if (admission.animalAdmission.id) handleUpdateAnimalAdmission({ ...admission, isOpen: false });
									else removeAnimalAdmission(admission.randomId);
								}}
							/>
						) : (
							<BasicAnimalAdmissionInfoCard animalAdmissionItem={admission} />
						)}
					</div>
				))}

				<Card className='py-4'>
					<CardContent className='flex items-center justify-between'>
						{selectedCertificate?.quantity && (
							<>
								{isCompleted
									? `✅ Total correcto (${selectedCertificate.quantity} animales)`
									: `⚠️ El total debe coincidir con el certificado (${selectedCertificate.quantity} animales)`}
							</>
						)}
						<Button variant='outline'>
							{+totalAnimals}/{selectedCertificate?.quantity ?? 0}
						</Button>
					</CardContent>
				</Card>

				<div className='flex justify-end gap-2'>
					<Button variant='outline' onClick={handleNextStep3}>
						Continuar con transporte
					</Button>
					{/* <ConfirmationDialog
						title={`¿Esta seguro que desea finalizar el ingreso de animales?`}
						description={`Esta acción completará el ingreso de los animales y se reiniciará el formulario para un nuevo ingreso.`}
						onConfirm={() => handleResetPage()}
						triggerBtn={
							<Button
								variant='ghost'
								className='bg-emerald-600 hover:bg-emerald-600 hover:text-white text-white'
								type='button'
								disabled={!isCompleted}
							>
								<Save />
								Finalizar ingreso de animales
							</Button>
						}
						cancelBtn={
							<Button variant='outline' size='lg'>
								<XIcon />
								Continuar editando
							</Button>
						}
						confirmBtn={
							<Button variant='ghost' className='bg-emerald-600 hover:bg-emerald-600 hover:text-white text-white' size='lg'>
								<Check />
								Si
							</Button>
						}
					/> */}
				</div>
			</AccordionContent>
		</AccordionItem>
	);
};
