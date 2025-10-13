import { Check, Edit, FileText, Trash2, XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimalAdmissionItem } from '../context/reception-provider';
import { useStep2Animals } from '../hooks/use-step-2-animals';
import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { corralTypesCode } from '@/features/corral/constants/corral-types-code';
import { toCapitalize } from '@/lib/toCapitalize';

interface Props {
	animalAdmissionItem: AnimalAdmissionItem;
}

export const BasicAnimalAdmissionInfoCard = ({ animalAdmissionItem }: Props) => {
	const { selectedSpecie, handleRemoveAnimalAdmission, handleReconstructAnimalAdmissionData } = useStep2Animals();
	return (
		<Card>
			<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
				<CardTitle className='text-sm font-medium'>Registro #{animalAdmissionItem.animalAdmission.id}</CardTitle>
				<div className='flex gap-2'>
					<Button
						variant='outline'
						size='sm'
						onClick={() => handleReconstructAnimalAdmissionData(animalAdmissionItem)}
						disabled={
							animalAdmissionItem?.animalAdmission?.corralType?.description?.toLowerCase()?.startsWith(corralTypesCode.EMERGENCIA.toLowerCase()) ||
							animalAdmissionItem.isRetrieveFormData
						}
					>
						<Edit className='h-4 w-4' />
						{animalAdmissionItem.isRetrieveFormData ? 'Cargando...' : 'Editar'}
					</Button>
					<Button variant='outline' size='sm' className='bg-emerald-600 hover:bg-emerald-600 hover:text-white text-white'>
						<FileText className='h-4 w-4' />
						Ticket
					</Button>

					<ConfirmationDialog
						title='¿Estás seguro de que deseas eliminar este ingreso?'
						description='Esta acción no se puede deshacer. Esto eliminará permanentemente el ingreso de animales.'
						onConfirm={() => handleRemoveAnimalAdmission(animalAdmissionItem.randomId)}
						triggerBtn={
							<Button
								variant='destructive'
								size='sm'
								disabled={
									animalAdmissionItem?.animalAdmission?.corralType?.description
										?.toLowerCase()
										?.startsWith(corralTypesCode.EMERGENCIA.toLowerCase()) || animalAdmissionItem.state === 'deleting'
								}
							>
								<Trash2 className='h-4 w-4' />
								{animalAdmissionItem.state === 'deleting' ? 'Eliminando...' : 'Eliminar'}
							</Button>
						}
						cancelBtn={
							<Button variant='outline' size='lg'>
								<XIcon />
								No
							</Button>
						}
						confirmBtn={
							<Button variant='ghost' className=' hover:bg-emerald-600 hover:text-' size='lg'>
								<Check />
								Si
							</Button>
						}
					/>
				</div>
			</CardHeader>
			<CardContent>
				<div className='space-y-2 text-sm'>
					<div className='grid grid-cols-2 gap-4'>
						<div>
							<span className='font-medium'>Introductor:</span> {animalAdmissionItem?.animalAdmission?.brand?.introducer?.name}
						</div>
						<div>
							<span className='font-medium'>Especie:</span> {toCapitalize(selectedSpecie?.name ?? '')}
						</div>
						<div>
							<span className='font-medium'>Cantidades: </span> H: {animalAdmissionItem?.animalAdmission?.females || 0}, M:{' '}
							{animalAdmissionItem?.animalAdmission?.males || 0}
						</div>
						<div>
							<span className='font-medium'>Fecha Faenamiento: </span> {animalAdmissionItem?.animalAdmission?.date?.split('T')[0] || 'N/A'}
						</div>
						<div>
							<span className='font-medium'>Tipo de Corral: </span> {animalAdmissionItem?.animalAdmission?.corralType?.description}
						</div>
						<div>
							<span className='font-medium'>Corral: </span>
							{animalAdmissionItem?.animalAdmission?.corral?.name || animalAdmissionItem.retrievedFromApi?.statusCorrals.corral.name || ''}
						</div>
						<div>
							<span className='font-medium'>Observación:</span> {animalAdmissionItem?.animalAdmission?.observations || 'N/A'}
						</div>
						<div>
							{animalAdmissionItem?.animalAdmission?.finishType?.name && (
								<span className='font-medium'>
									Tipo de acabado:
									{toCapitalize(
										animalAdmissionItem?.animalAdmission?.finishType?.name || animalAdmissionItem?.animalAdmission?.corralGroup?.name || ''
									)}
								</span>
							)}
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};
