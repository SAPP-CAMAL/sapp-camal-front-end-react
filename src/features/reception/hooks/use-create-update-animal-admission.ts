import { add } from 'date-fns';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useDebouncedCallback } from 'use-debounce';
import { CorralGroupBySpecieResponse } from '@/features/corral-group/domain';
import { useAllSpecies } from '@/features/specie/hooks';
import { useAnimalAdmissionParams } from './use-animal-admission-params';
import { getCorralGroupBySpecieAndType } from '@/features/corral-group/server/db/corral-group.service';
import { useBrandByFilter } from '@/features/brand/hooks/use-brand-by-filter';
import { useAllCorralType } from '@/features/corral/hooks';
import { Corral, CorralType } from '@/features/corral/domain';
import { getCorralsByTypeAndGroup } from '@/features/corral/server/db/corral.service';
import { getCertBrandById, saveCertBrand, updateCertBrand } from '@/features/setting-certificate-brand/server/db/setting-cert-brand.service';
import { useStep2Animals } from './use-step-2-animals';
import { getStatusCorralsByDate } from '@/features/corral/server/db/status-corral.service';
import { corralTypesCode } from '@/features/corral/constants/corral-types-code';
import { useProductiveStagesBySpecie } from '@/features/productive-stage/hooks';
import { useAllAnimalSex } from '@/features/animal-sex/hooks';
import { AnimalSexCodes } from '@/features/animal-sex/constants';
import { ProductiveStage } from '@/features/productive-stage/domain';
import { FinishType } from '@/features/finish-type/domain';
import { useFinishTypeBySpecies } from '@/features/finish-type/hooks';
import { SPECIES_CODE } from '@/features/specie/constants';
import { BrandByFilterMapped } from '@/features/brand/domain/get-brand-by-filter';

export type AnimalAdmissionForm = {
	/** setting cert brand id */
	id?: number;
	corralGroup?: CorralGroupBySpecieResponse;
	brand?: BrandByFilterMapped;
	corralGroups?: CorralGroupBySpecieResponse[];
	corral?: Corral & { closeCorral: boolean };
	corrals?: (Corral & { closeCorral: boolean })[];
	date?: string;
	males: number;
	females: number;
	corralType?: CorralType;
	finishType?: FinishType;
	observations?: string;
	isLoadingCorrals?: boolean;
	isLoadingCorralGroups?: boolean;
	selectedProductiveStages: (ProductiveStage & { quantity: number })[];
};

const defaultValues: AnimalAdmissionForm = {
	date: new Date().toISOString(),
	males: 0,
	females: 0,
	selectedProductiveStages: [],
};

const btnValue = {
	isSubmitting: {
		create: 'Creando...',
		update: 'Actualizando...',
	},
	submit: {
		create: 'Crear',
		update: 'Actualizar',
	},
};

interface Props {
	animalAdmissionData: Partial<AnimalAdmissionForm>;
	onSave?: (animalAdmission?: AnimalAdmissionForm) => void;
}

export const useCreateUpdateAnimalAdmission = ({ animalAdmissionData, onSave }: Props) => {
	const { selectedCertificate, totalAnimals, selectedSpecie, handleSetSelectedSpecie, handleRemoveSelectedSpecie } = useStep2Animals();
	const form = useForm<AnimalAdmissionForm>({
		defaultValues: {
			...defaultValues,
			...animalAdmissionData,
		},
	});

	const resetTotalAnimals = totalAnimals - ((animalAdmissionData.females || 0) + +(animalAdmissionData.males || 0));

	const { searchParams, setSearchParams } = useAnimalAdmissionParams();

	const selectedBrand = form.watch('brand');

	const brandsQuery = useBrandByFilter({
		...(searchParams.introducerName.length > 0 && { fullName: searchParams.introducerName }),
		...(searchParams.introducerIdentification.length > 0 && { identification: searchParams.introducerIdentification }),
		...(searchParams.introducerBrand.length > 0 && { name: searchParams.introducerBrand }),
		...(selectedSpecie && { idSpecie: selectedSpecie.id }),
	});

	const productiveStagesQuery = useProductiveStagesBySpecie(selectedSpecie?.id ?? 0);
	const finishTypeQuery = useFinishTypeBySpecies(selectedSpecie?.id ?? 0);
	const corralTypesQuery = useAllCorralType();
	const animalSexQuery = useAllAnimalSex();
	const speciesQuery = useAllSpecies();

	const brands = brandsQuery.data.filter(brand => brand.status);
	const corralTypes = corralTypesQuery.data.data.filter(corralType => corralType.status);
	const species = speciesQuery.data.data.filter(specie => specie.status);
	const productiveStages = productiveStagesQuery.data.data.filter(stage => stage.status);
	const male = animalSexQuery.data.data.filter(sex => sex.status).find(sex => sex.code === AnimalSexCodes.MALE);
	const female = animalSexQuery.data.data.filter(sex => sex.status).find(sex => sex.code === AnimalSexCodes.FEMALE);
	const finishTypes = finishTypeQuery.data.data.filter(type => type.status);

	const selectedProductiveStage = form.watch('selectedProductiveStages');

	const maleProductiveStage = productiveStages
		.filter(stage => stage.idAnimalSex === male?.id)
		.map(stage => {
			const selectedStage = selectedProductiveStage.find(s => s.id === stage.id);

			return { ...stage, quantity: selectedStage?.quantity || 0 };
		});
	const femaleProductiveStage = productiveStages
		.filter(stage => stage.idAnimalSex === female?.id)
		.map(stage => {
			const selectedStage = selectedProductiveStage.find(s => s.id === stage.id);

			return { ...stage, quantity: selectedStage?.quantity || 0 };
		});

	const handleResetFields = () => {
		try {
			form.setValue('isLoadingCorrals', false);
			form.setValue('isLoadingCorralGroups', false);
			form.setValue('corralGroups', []);
			form.setValue('corralGroup', undefined);
			form.setValue('corrals', []);
			form.setValue('corral', undefined);
		} catch (error) {
			console.log(error);
		}
	};

	const handleSearchCorralGroups = async () => {
		const corralTypeId = form.watch('corralType')?.id;
		form.setValue('finishType', undefined);

		if (!selectedSpecie) return toast.error('Debe seleccionar una especie');
		if (!corralTypeId) return;

		form.setValue('isLoadingCorralGroups', true);
		form.setValue('corralGroup', undefined);
		form.setValue('corralGroups', []);
		form.setValue('corral', undefined);

		try {
			const corrals = await getCorralGroupBySpecieAndType(selectedSpecie.id.toString(), corralTypeId.toString());

			form.setValue('corralGroups', corrals.data);

			if (corrals.data.length === 1) form.setValue('corralGroup', corrals.data[0]);
			if (corrals.data.length === 1) await handleSearchCorrals();

			form.setValue('isLoadingCorralGroups', false);
		} catch (error) {
			form.setValue('isLoadingCorralGroups', false);
		}
	};

	const getFinishTypeForNormalCorralType = () => {
		const finishType = form.watch('finishType');

		if (finishType) return finishType;

		const specie = selectedSpecie;

		if (!specie?.name.toLowerCase().startsWith(SPECIES_CODE.PORCINO.toLowerCase())) return;

		const corralType = form.watch('corralType')?.description?.toLowerCase();
		const isNormalCorral = corralType?.startsWith(corralTypesCode.NORMAL.toLowerCase());
		const corralGroup = form.watch('corralGroup');

		if (!corralType) return;
		if (!corralGroup) return;
		if (!isNormalCorral) return;

		return finishTypes.find(type => type.name.toLowerCase().startsWith(corralGroup.description.toLowerCase()));
	};

	const handleSearchCorrals = async () => {
		const corralTypeId = form.watch('corralType')?.id;
		const groupId = form.watch('corralGroup')?.id;

		if (!groupId) form.setValue('corralType', undefined);
		if (!corralTypeId) form.setValue('corralGroup', undefined);

		if (!corralTypeId || !groupId) return;

		form.setValue('corral', undefined);
		form.setValue('isLoadingCorrals', true);

		try {
			let availableCorrals = [];

			const corrals = (await getCorralsByTypeAndGroup(corralTypeId.toString(), groupId.toString()))?.data ?? [];

			const corralsStatus = (await getStatusCorralsByDate(new Date().toISOString().split('T')[0]))?.data ?? [];

			availableCorrals = corrals
				.filter(corral => !corralsStatus.find(status => status.idCorrals === corral.id))
				.map(c => ({ ...c, closeCorral: false }));

			corrals.forEach(corral => {
				const status = corralsStatus.find(status => status.idCorrals === corral.id);
				if (status && !status.closeCorral) availableCorrals.push({ ...corral, closeCorral: false });
			});

			availableCorrals = availableCorrals.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
			// availableCorrals = availableCorrals.sort((a, b) => a.id - b.id);

			form.setValue('corrals', availableCorrals);

			if (availableCorrals.length === 1) form.setValue('corral', availableCorrals[0]);

			form.setValue('isLoadingCorrals', false);
		} catch (error) {
			form.setValue('isLoadingCorrals', false);
			console.log(error);
		}
	};

	const debounceIntroducerName = useDebouncedCallback((text: string) => setSearchParams({ introducerName: text }), 500);
	const debounceIntroducerIdentification = useDebouncedCallback((text: string) => setSearchParams({ introducerIdentification: text }), 500);
	const debounceIntroducerBrand = useDebouncedCallback((text: string) => setSearchParams({ introducerBrand: text }), 500);

	const handleSaveOrUpdateAnimalAdmission = async (data: AnimalAdmissionForm) => {
		const quantityMale = +data.males || 0;
		const quantityFemale = +data.females || 0;
		const total = quantityMale + quantityFemale;

		const subTotal = resetTotalAnimals + total;

		if (!selectedSpecie) return toast.error('Debe seleccionar una especie');
		if (total < 1) return toast.error('Debe ingresar al menos un animal');
		if (subTotal < 1) return;
		if (!data?.brand?.id) return;
		if (subTotal > +(selectedCertificate?.quantity || 0)) return;

		let detailsCertificateBrand = data.selectedProductiveStages.map(stage => ({
			idProductiveStage: stage.id,
			quantity: stage.quantity,
			status: true,
		}));

		const idFinishType = data.finishType?.id || data.corralGroup?.idFinishType;
		const request = {
			idBrands: data.brand?.id ?? NaN,
			idCertificate: selectedCertificate?.id ?? NaN,
			commentary: data.observations || '',
			females: quantityFemale,
			males: quantityMale,
			idCorral: data.corral?.id ?? NaN,
			slaughterDate: data.date,
			idSpecies: selectedSpecie.id,
			idCorralType: data.corralType?.id ?? NaN,
			status: true,
			...(idFinishType && { idFinishType }),
		};

		try {
			if (data.id) {
				const previousData = (await getCertBrandById(data.id.toString()))?.data?.detailsCertificateBrand ?? [];
				const dataLost = previousData
					.filter(data => !detailsCertificateBrand.find(d => d.idProductiveStage === data.idProductiveStage))
					.map(data => ({ idProductiveStage: data.idProductiveStage, quantity: 0, status: false }));

				detailsCertificateBrand = [...detailsCertificateBrand, ...dataLost];
				detailsCertificateBrand = detailsCertificateBrand.map(detail => ({ ...detail, idSettingCertificateBrands: data.id }));

				await updateCertBrand(data.id.toString(), { ...request, detailsCertificateBrand });

				onSave?.({ ...data, males: quantityMale, females: quantityFemale });
			} else {
				const response = await saveCertBrand({ ...request, detailsCertificateBrand });

				onSave?.({ ...data, id: response.data.id, males: quantityMale, females: quantityFemale });
			}

			// handleContinue();

			toast.success('Ingreso de animales guardado con éxito');
		} catch (error) {
			toast.error('Ocurrió un error al guardar el ingreso de animales');
		}
	};

	const handleSetDate = () => {
		const corral = form.watch('corralType')?.description?.toLowerCase();

		// if (corral?.startsWith(corralTypesCode.CUARENTENA.toLowerCase())) return form.setValue('date', undefined);
		if (corral?.startsWith(corralTypesCode.EMERGENCIA.toLowerCase())) return form.setValue('date', new Date().toISOString());

		form.setValue('date', add(new Date(), { days: 1 }).toISOString());
	};

	const handleUpdateSelectedProductiveStages = (stageId: string | number, quantity: number) => {
		const femaleUpdatedStages = femaleProductiveStage.map(stage => {
			if (stage.id !== +stageId) return stage;
			return { ...stage, quantity };
		});
		const maleUpdatedStages = maleProductiveStage.map(stage => {
			if (stage.id !== +stageId) return stage;
			return { ...stage, quantity };
		});

		const selectedProductiveStages = [...femaleUpdatedStages, ...maleUpdatedStages].filter(stage => stage.quantity > 0);

		const females = femaleUpdatedStages.reduce((acc, stage) => acc + stage.quantity, 0);
		const males = maleUpdatedStages.reduce((acc, stage) => acc + stage.quantity, 0);

		const subTotal = females + males;

		if (subTotal < 0) return;

		form.setValue('females', females);
		form.setValue('males', males);

		form.setValue('selectedProductiveStages', selectedProductiveStages);
	};

	const showBrandsList =
		!brandsQuery.isFetching &&
		!!selectedSpecie &&
		!selectedBrand &&
		!!(searchParams.introducerName || searchParams.introducerIdentification || searchParams.introducerBrand);

	const showEmptyBrandsAlert =
		!!(searchParams.introducerName || searchParams.introducerIdentification || searchParams.introducerBrand) &&
		!brandsQuery.isFetching &&
		brands.length === 0;

	const totalFormAnimals = +form.watch('females') + +form.watch('males');

	const isQuantitiesLessThan1 =
		totalFormAnimals < 1 && (form.formState.touchedFields.males || form.formState.touchedFields.females || form.formState.isSubmitted);

	const isQuantityExceeds = resetTotalAnimals + totalFormAnimals > +(selectedCertificate?.quantity || 0);

	const isInvalidBrand = !selectedBrand && (form.formState.touchedFields.brand || form.formState.isSubmitted);

	const btnType = animalAdmissionData.id ? 'update' : 'create';
	const btnSubmitting = form.formState.isSubmitting ? 'isSubmitting' : 'submit';

	const btnMessage = btnValue[btnSubmitting][btnType];

	const corralType = form.watch('corralType')?.description?.toLowerCase();
	const isNormalCorral = corralType?.startsWith(corralTypesCode.NORMAL.toLowerCase());
	const isEmergencyCorral = corralType?.startsWith(corralTypesCode.EMERGENCIA.toLowerCase());

	const showLoadingBrands =
		brandsQuery.isFetching &&
		!selectedBrand &&
		(searchParams.introducerName.length > 0 || searchParams.introducerIdentification.length > 0 || searchParams.introducerBrand.length > 0);

	return {
		form,
		species,
		brands,
		showBrandsList,
		searchParams,
		brandsQuery,
		corralTypes,
		corralTypesQuery,
		isQuantitiesLessThan1,
		isQuantityExceeds,
		isInvalidBrand,
		btnMessage,
		showEmptyBrandsAlert,
		isEmergencyCorral,
		selectedSpecie,
		showLoadingBrands,
		productiveStages,
		productiveStagesQuery,
		maleProductiveStage,
		femaleProductiveStage,
		isNormalCorral,
		finishTypes,
		finishTypeQuery,

		// actions
		debounceIntroducerName,
		debounceIntroducerIdentification,
		debounceIntroducerBrand,

		handleSetDate,
		handleResetFields,
		handleSearchCorrals,
		handleSearchCorralGroups,
		handleSaveOrUpdateAnimalAdmission,
		handleUpdateSelectedProductiveStages,

		handleSetSelectedSpecie,
		handleRemoveSelectedSpecie,
	};
};
