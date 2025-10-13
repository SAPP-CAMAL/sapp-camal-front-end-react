import { toast } from 'sonner';
import { useReceptionContext } from './use-reception-context';
import { deleteCertBrand } from '@/features/setting-certificate-brand/server/db/setting-cert-brand.service';
import { AnimalAdmissionItem } from '../context/reception-provider';
import { getBrandByFilter } from '@/features/brand/server/db/brand.service';
import { getCorralGroupById, getCorralGroupBySpecieAndType } from '@/features/corral-group/server/db/corral-group.service';
import { getCorralById, getCorralsByTypeAndGroup } from '@/features/corral/server/db/corral.service';
import { getStatusCorralsByDate } from '@/features/corral/server/db/status-corral.service';
import { getAllProductiveStages } from '@/features/productive-stage/server/db/productive-stage.service';

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
	} = useReceptionContext();

	const totalAnimals = animalAdmissionList.reduce(
		(sum, admission) => sum + (+(admission.animalAdmission.males || 0) + +(admission.animalAdmission.females || 0)),
		0
	);
	const isCompleted = totalAnimals === +(selectedCertificate?.quantity || 0);

	const handleNextStep3 = async () => {
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
			removeAnimalAdmission(randomId);
			toast.success('Ingreso de animal eliminado correctamente');
		} catch (error) {
			toast.error('Error al eliminar el ingreso de animal');
		}
	};

	const handleReconstructAnimalAdmissionData = async (incompleteData: AnimalAdmissionItem) => {
		const isAlreadyComplete =
			incompleteData.animalAdmission.brand?.introducer.identification &&
			incompleteData.animalAdmission.corralGroup &&
			incompleteData.animalAdmission.corralGroups &&
			incompleteData.animalAdmission.corral &&
			incompleteData.animalAdmission.corrals &&
			incompleteData.animalAdmission.selectedProductiveStages;

		if (isAlreadyComplete) return handleUpdateAnimalAdmission({ ...incompleteData, isOpen: true, isRetrieveFormData: false });

		const animalAdmission = incompleteData.animalAdmission;

		const corralTypeId = animalAdmission.corralType?.id.toString() ?? '';
		const corralGroupId = incompleteData.retrievedFromApi?.corralGroup.id.toString() ?? '';
		const detailCertificateBrand = incompleteData.retrievedFromApi?.detailsCertificateBrand;

		handleUpdateAnimalAdmission({ ...incompleteData, isOpen: false, isRetrieveFormData: true });

		try {
			// 1. Retrieve introducer identification if missing
			if (!animalAdmission.brand?.introducer.identification) {
				const brand = (await getBrandByFilter({ name: animalAdmission.brand?.name || '', idSpecie: selectedSpecie?.id })).data.at(0);
				if (brand) {
					animalAdmission.brand = {
						...brand,
						introducer: {
							id: brand.introducer.id,
							name: brand?.introducer.user?.person?.fullName,
							identification: brand?.introducer.user?.person?.identification,
						},
					};
				}
			}
		} catch (error) {}

		try {
			// 2. Retrieve corral groups
			const corralGroups = await getCorralGroupBySpecieAndType(selectedSpecie?.id.toString() ?? '', corralTypeId);
			const corralGroup = await getCorralGroupById(corralGroupId);

			animalAdmission.corralGroups = corralGroups.data;
			animalAdmission.corralGroup = corralGroup.data;
		} catch (error) {}

		try {
			// 3. Retrieve selected corral
			const corral = await getCorralById(incompleteData.retrievedFromApi?.statusCorrals.corral?.id.toString() ?? '');

			const corrals = (await getCorralsByTypeAndGroup(corralTypeId, corralGroupId))?.data ?? [];

			const corralsStatus = (await getStatusCorralsByDate(new Date().toISOString().split('T')[0]))?.data ?? [];

			let availableCorrals = corrals
				.filter(corral => !corralsStatus.find(status => status.idCorrals === corral.id))
				.map(c => ({ ...c, closeCorral: false }));

			corrals.forEach(corral => {
				const status = corralsStatus.find(status => status.idCorrals === corral.id);
				if (status && !status.closeCorral) availableCorrals.push({ ...corral, closeCorral: false });
			});

			availableCorrals = availableCorrals.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

			animalAdmission.corral = { ...corral.data, closeCorral: false };
			animalAdmission.corrals = availableCorrals;
		} catch (error) {}

		try {
			// 4. Retrieve selected productive stages
			const allProductiveStages = (await getAllProductiveStages()).data;
			animalAdmission.selectedProductiveStages = detailCertificateBrand
				?.map(detail => {
					const productiveStage = allProductiveStages.find(stage => stage.id === detail.idProductiveStage);
					if (!productiveStage) return;
					return { ...productiveStage, quantity: detail.quantity };
				})
				.filter(stage => !!stage);
		} catch (error) {}

		handleUpdateAnimalAdmission({ ...incompleteData, animalAdmission, isOpen: true, isRetrieveFormData: false });
	};

	return {
		step2Accordion,
		selectedCertificate,
		selectedSpecie,
		animalAdmissionList,
		totalAnimals,
		isCompleted,
		// species,
		// speciesQuery,

		handleChangeStep2,
		handleAddNewAnimalAdmission,
		handleUpdateAnimalAdmission,
		handleRemoveAnimalAdmission,
		removeAnimalAdmission,
		handleNextStep3,
		handleSetSelectedSpecie,
		handleRemoveSelectedSpecie,

		// Reconstruct data
		handleReconstructAnimalAdmissionData,
	};
};
