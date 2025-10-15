import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { useDisinfectant } from './use-disinfectant';
import { useQueryClient } from '@tanstack/react-query';
import { useAllSpecies } from '@/features/specie/hooks';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useShippersList } from '@/features/shipping/hooks';
import { DailyRegisterFormData } from '@/features/disinfectant/domain';
import { CreateDetailRegisterVehicle, UpdateDetailRegisterVehicle } from '@/features/vehicles/domain';
import { useDailyDisinfectionRegisterContext } from './use-daily-disinfection-register-context';
import {
	createRegisterVehicleService,
	updateDetailRegisterVehicleService,
	updateRegisterVehicleService,
} from '@/features/vehicles/server/db/detail-register-vehicle.service';
import { DETAIL_REGISTER_VEHICLE_TAG } from '@/features/vehicles/constants';
import { updateCertificateService } from '@/features/certificate/server/db/certificate.service';
import { ShipperBasicData } from '@/features/shipping/domain';

const getCurrentTime = () => new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

const defaultValues = {
	disinfectant: '',
	dosage: '',
	admissionApplicationTime: getCurrentTime(),
	departureApplicationTime: '',
	observations: '',
	fullName: '',
	identification: '',
	plate: '',
	showShipperAlert: false,
} as DailyRegisterFormData;

interface SearchParams {
	fullName: string;
	identification: string;
	plate: string;
}

const defaultSearchParams = { fullName: '', identification: '', plate: '' };

export const useRegisterDisinfectantData = () => {
	const queryClient = useQueryClient();

	const {
		formData,
		selectedCertificate,
		dailyDisinfectionRegister,
		handleSetSelectedCertificate,
		handleRemoveSelectedCertificate,
		handleRemoveDailyDisinfectionRegister,
		handleRemoveSelectedFormData,
	} = useDailyDisinfectionRegisterContext();

	const form = useForm<DailyRegisterFormData>({ defaultValues });

	const [searchParams, setSearchParams] = useState<SearchParams>(defaultSearchParams);

	const selectedCertificatePlate = selectedCertificate?.plateVehicle || '';
	const query = useShippersList(searchParams);
	const disinfectantQuery = useDisinfectant();
	const speciesQuery = useAllSpecies();

	const shippers = (query.data?.data.items ?? []).filter(shipper => shipper.status);
	const disinfectants = (disinfectantQuery.data?.data ?? []).filter(disinfectant => disinfectant.status);
	const species = (speciesQuery.data?.data ?? []).filter(specie => specie.status);

	const isSpeciesLoading = speciesQuery.isLoading;
	const isShippersLoading = query.isFetching;

	const selectedShipper = form.watch('shipper');

	const { fullName, identification, plate } = searchParams;

	const isSomeFieldFilled = identification.length > 0 || fullName.length > 0 || plate.length > 0 || selectedCertificatePlate.length > 0;
	const showShippersList = isSomeFieldFilled && !selectedShipper && shippers?.length > 0 && !isShippersLoading;

	useEffect(() => {
		handleSearchFields('plate', dailyDisinfectionRegister?.registerVehicle.shipping.vehicle.plate || selectedCertificatePlate || '');
		setSearchParams(prev => ({
			...prev,
			plate: dailyDisinfectionRegister?.registerVehicle.shipping.vehicle.plate || selectedCertificatePlate || '',
		}));

		if (formData) return form.reset(formData);

		form.reset({
			id: dailyDisinfectionRegister?.id,
			idRegisterVehicle: dailyDisinfectionRegister?.idRegisterVehicle,
			dosage: dailyDisinfectionRegister?.dosage ?? '',
			disinfectant: dailyDisinfectionRegister?.disinfectant.id.toString() ?? '',
			admissionApplicationTime: dailyDisinfectionRegister?.timeStar ?? getCurrentTime(),
			departureApplicationTime: dailyDisinfectionRegister?.timeEnd ?? '',
			observations: dailyDisinfectionRegister?.commentary ?? '',
			transportedSpecie: dailyDisinfectionRegister?.species.id,
			shipper: dailyDisinfectionRegister && {
				id: dailyDisinfectionRegister.registerVehicle.shipping.id ?? NaN,
				firstName: dailyDisinfectionRegister.registerVehicle.shipping.person.fullName ?? '',
				lastName: dailyDisinfectionRegister.registerVehicle.shipping.person.lastName ?? '',
				identification: dailyDisinfectionRegister.registerVehicle.shipping.person.identification ?? '',
				identificationTypeId: dailyDisinfectionRegister.registerVehicle.shipping.person.identificationTypeId?.toString() ?? '',
				plate: dailyDisinfectionRegister.registerVehicle.shipping.vehicle.plate ?? '',
				transportType: dailyDisinfectionRegister.registerVehicle.shipping.vehicle.vehicleDetail.transportType.name ?? '',
				transportTypeId: dailyDisinfectionRegister.registerVehicle.shipping.vehicle.vehicleDetail.transportTypeId.toString() ?? '',
				vehicleId: dailyDisinfectionRegister.registerVehicle.shipping.vehicleId.toString() ?? '',
				vehicleType: dailyDisinfectionRegister.registerVehicle.shipping.vehicle.vehicleDetail.vehicleType.name ?? '',
				vehicleTypeId: dailyDisinfectionRegister.registerVehicle.shipping.vehicle.vehicleDetail.vehicleTypeId.toString() ?? '',
			},
			fullName: dailyDisinfectionRegister?.registerVehicle.shipping.person.fullName ?? '',
			identification: dailyDisinfectionRegister?.registerVehicle.shipping.person.identification ?? '',
			plate: dailyDisinfectionRegister?.registerVehicle.shipping.vehicle.plate || selectedCertificatePlate || '',
		});
	}, [dailyDisinfectionRegister, form, selectedCertificatePlate, formData]);

	const debounceSearchFields = useDebouncedCallback((field: 'fullName' | 'identification' | 'plate', text: string) => {
		setSearchParams(prev => ({ ...prev, [field]: text }));
	}, 500);

	const handleSearchFields = (field: 'fullName' | 'identification' | 'plate', text: string) => {
		if (field === 'plate' && selectedCertificatePlate) return;
		form.setValue(field, text);
		debounceSearchFields(field, text);
	};

	const handleRegisterDisinfectantData: SubmitHandler<DailyRegisterFormData> = async data => {
		const { shipper, observations, disinfectant, departureApplicationTime, admissionApplicationTime, dosage, transportedSpecie } = data;

		if (!shipper) {
			form.setValue('showShipperAlert', true);
			return toast.error('Por favor seleccione un transportista.');
		}

		const timeEnd = departureApplicationTime ? departureApplicationTime.split(':').slice(0, 2).join(':') : null;

		try {
			// 1. Update the certificate if it exists with shipping id.
			if (selectedCertificate) {
				const response = await updateCertificateService(selectedCertificate.id, {
					code: selectedCertificate.code,
					issueDate: selectedCertificate.issueDate,
					placeOrigin: selectedCertificate.placeOrigin,
					quantity: selectedCertificate.quantity,
					plateVehicle: selectedCertificate.plateVehicle,
					status: selectedCertificate.status,
					authorizedTo: selectedCertificate.authorizedTo,
					originAreaCode: selectedCertificate.originAreaCode,
					destinationAreaCode: selectedCertificate.destinationAreaCode,
					urlFile: selectedCertificate.urlFile,
					idOrigin: selectedCertificate.origin?.id ?? 0,
					shippingsId: shipper.id,
				});

				handleSetSelectedCertificate(response.data);
			}

			// 2. Create or update the daily disinfection register
			if (data.id) {
				const requestData: UpdateDetailRegisterVehicle = {
					idDisinfectant: +disinfectant,
					commentary: observations,
					dosage,
					status: true,
					timeStar: admissionApplicationTime.split(':').slice(0, 2).join(':'),
					idSpecies: transportedSpecie,
					...(timeEnd && { timeEnd }),
				};

				if (data.idRegisterVehicle) await updateRegisterVehicleService(data.idRegisterVehicle, { idShipping: shipper.id });
				await updateDetailRegisterVehicleService(data.id, requestData);

				toast.success('Registro actualizado exitosamente');
			} else {
				const requestData: CreateDetailRegisterVehicle = {
					idDisinfectant: +disinfectant,
					commentary: observations,
					dosage,
					status: true,
					timeStar: admissionApplicationTime,
					idSpecies: transportedSpecie,
					...(timeEnd && { timeEnd }),
				};

				await createRegisterVehicleService(shipper.id, requestData);

				toast.success('Registro creado exitosamente');
			}

			form.reset({ ...defaultValues, admissionApplicationTime: getCurrentTime() });
			form.setValue('id', undefined);
			form.setValue('shipper', undefined);
			form.clearErrors();

			// Reset search params
			setSearchParams(defaultSearchParams);
			handleSearchFields('plate', '');
			handleSearchFields('fullName', '');
			handleSearchFields('identification', '');

			handleRemoveSelectedCertificate();
			handleRemoveSelectedFormData();
			handleRemoveDailyDisinfectionRegister();

			await queryClient.invalidateQueries({ queryKey: [DETAIL_REGISTER_VEHICLE_TAG] });
		} catch (error: any) {
			const { message } = await error.response.json();
			toast.error(message ?? 'Ocurrió un error al guardar el registro.');
		}
	};

	const handleRemoveSelected = () => {
		// Reset form to default values
		form.reset({ ...defaultValues, admissionApplicationTime: getCurrentTime() });
		form.setValue('id', undefined);
		form.setValue('shipper', undefined);
		form.clearErrors();

		// Reset search params
		setSearchParams(defaultSearchParams);

		// Remove selected data from context
		handleRemoveSelectedFormData();
		handleRemoveDailyDisinfectionRegister();
		handleRemoveSelectedCertificate();
	};

	const handleSetShipper = async (shipper?: ShipperBasicData) => {
		form.setValue('shipper', shipper);

		if (!selectedCertificate) return;
		if (selectedCertificate?.plateVehicle) return;

		const response = await updateCertificateService(selectedCertificate.id, {
			code: selectedCertificate.code,
			issueDate: selectedCertificate.issueDate,
			placeOrigin: selectedCertificate.placeOrigin,
			quantity: selectedCertificate.quantity,
			plateVehicle: shipper?.plate || '',
			status: selectedCertificate.status,
			authorizedTo: selectedCertificate.authorizedTo,
			originAreaCode: selectedCertificate.originAreaCode,
			destinationAreaCode: selectedCertificate.destinationAreaCode,
			urlFile: selectedCertificate.urlFile,
			idOrigin: selectedCertificate.origin?.id ?? 0,
			shippingsId: shipper?.id,
		});

		handleSetSelectedCertificate(response.data);
	};

	const isEditing = !!dailyDisinfectionRegister || !!formData;

	let btnValue = !isEditing && form.formState.isSubmitting ? 'Guardando Registro...' : 'Guardar Registro';

	if (isEditing) btnValue = form.formState.isSubmitting ? 'Actualizando Registro...' : 'Actualizar Registro';

	const addShipper = !!selectedCertificatePlate || !!plate;
	const addVehicle = !!searchParams.fullName || !!searchParams.identification;

	return {
		// data
		form,
		species,
		btnValue,
		shippers,
		disinfectants,
		selectedShipper,
		showShippersList,
		isSpeciesLoading,
		isShippersLoading,
		isEditing,
		addVehicle,
		addShipper,
		selectedCertificatePlate,
		selectedCertificate,
		showCreateShippingFromSomeFields: isSomeFieldFilled && !selectedShipper && shippers?.length < 1 && !isShippersLoading,

		// actions
		handleSetShipper,
		handleSearchFields,
		handleRemoveSelected,
		handleRegisterDisinfectantData,
		handleRemoveSelectedCertificate,
	};
};
