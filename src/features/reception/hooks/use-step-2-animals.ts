import { toast } from 'sonner';
import { useAllSpecies } from '@/features/specie/hooks';
import { useReceptionContext } from './use-reception-context';
import { deleteCertBrand } from '@/features/setting-certificate-brand/server/db/setting-cert-brand.service';
import { removeAnimalAdmissionFromLocalStorage } from '../utils';
import { useRouter } from 'next/navigation';

export const useStep2Animals = () => {
	const {
		step2Accordion,
		selectedCertificate,
		selectedSpecie,
		animalAdmissionList,
		handleChangeStep2,
		handleAddNewAnimalAdmission,
		handleUpdateAnimalAdmission,
		handleRemoveAnimalAdmission: removeAnimalAdmission,
		handleSetAccordionState,
		handleSetSelectedSpecie,
		handleRemoveSelectedSpecie,

		handleResetState,
	} = useReceptionContext();

	const router = useRouter();

	const speciesQuery = useAllSpecies();

	const species = speciesQuery.data.data.filter(specie => specie.status);

	const totalAnimals = animalAdmissionList.reduce(
		(sum, admission) => sum + (+(admission.animalAdmission.males || 0) + +(admission.animalAdmission.females || 0)),
		0
	);
	const isCompleted = totalAnimals === +(selectedCertificate?.quantity || 0);

	const handleContinue = () => {
		handleSetAccordionState({ name: 'step1Accordion', accordionState: { isOpen: false, state: 'completed' } });
		handleSetAccordionState({ name: 'step2Accordion', accordionState: { isOpen: !isCompleted, state: isCompleted ? 'completed' : 'enabled' } });
		handleSetAccordionState({ name: 'step3Accordion', accordionState: { isOpen: isCompleted, state: 'enabled' } });
	};

	const handleNextStep3 = () => {
		if (totalAnimals < selectedCertificate?.quantity!) toast.info('Aún faltan animales por registrar');
		handleSetAccordionState({ name: 'step1Accordion', accordionState: { isOpen: false, state: 'completed' } });
		handleSetAccordionState({ name: 'step2Accordion', accordionState: { isOpen: false, state: isCompleted ? 'completed' : 'enabled' } });
		handleSetAccordionState({ name: 'step3Accordion', accordionState: { isOpen: true, state: 'enabled' } });
	};

	const handleRemoveAnimalAdmission = async (randomId: string) => {
		const animalAdmissionItem = animalAdmissionList.find(item => item.randomId === randomId);

		if (!animalAdmissionItem || !animalAdmissionItem.animalAdmission.id) return;
		handleUpdateAnimalAdmission({ ...animalAdmissionItem, state: 'deleting' });

		try {
			await deleteCertBrand(animalAdmissionItem.animalAdmission.id?.toString());
			removeAnimalAdmission(randomId); // remove from context
			removeAnimalAdmissionFromLocalStorage(randomId); // remove from localStorage
			toast.success('Ingreso de animal eliminado correctamente');
		} catch (error) {
			toast.error('Error al eliminar el ingreso de animal');
		}
	};

	const handleResetPage = () => {
		handleResetState();
		router.push(window.location.pathname);
	};

	return {
		step2Accordion,
		selectedCertificate,
		selectedSpecie,
		animalAdmissionList,
		totalAnimals,
		isCompleted,
		species,
		speciesQuery,

		handleChangeStep2,
		handleAddNewAnimalAdmission,
		handleUpdateAnimalAdmission,
		handleRemoveAnimalAdmission,
		removeAnimalAdmission,
		handleContinue,
		handleNextStep3,
		handleSetSelectedSpecie,
		handleRemoveSelectedSpecie,
		handleResetPage,
	};
};
