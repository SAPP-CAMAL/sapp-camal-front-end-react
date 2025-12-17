import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { toCapitalize } from '@/lib/toCapitalize';
import { mapToAnimalAdmissions } from '../utils';
import { ShipperBasicData } from '@/features/shipping/domain';
import { Certificate } from '@/features/certificate/domain';
import { useReceptionContext } from './use-reception-context';
import { useCertificatesByCode } from '@/features/certificate/hooks';
import { updateCertificateService } from '@/features/certificate/server/db/certificate.service';
import {
	getDetailRegisterVehicleById,
	getDetailRegisterVehicleByIdShippingAndCertificateCodeService,
	getShippersByIdService,
} from '@/features/shipping/server/db/shipping.service';
import { getCertBrandByCertificateId, getSimpleSettingCertBrandByCertificateId } from '@/features/setting-certificate-brand/server/db/setting-cert-brand.service';
import { getConditionTransportByCertificateId } from '@/features/condition-transport/server/db/condition-transport.service';
import { useGetRegisterVehicleByDate } from '@/features/vehicles/hooks';

type state = 'enabled' | 'loading';
interface Step1State {
	identification: { value: string; searchValue: string; state: state };
	fullName: { value: string; searchValue: string; state: state };
	plate: { value: string; searchValue: string; state: state };
	certificateNumber: { value: string; searchValue: string; state: state };
}

const initialState: Step1State = {
	identification: { value: '', searchValue: '', state: 'enabled' },
	fullName: { value: '', searchValue: '', state: 'enabled' },
	plate: { value: '', searchValue: '', state: 'enabled' },
	certificateNumber: { value: '', searchValue: '', state: 'enabled' },
};

export const useStep1Certificate = () => {
	const {
		step1Accordion,
		selectedShipper,
		selectedCertificate,
		selectedSpecie,
		isFromQR,
		handleRemoveSelectedCertificate,
		handleSetSelectedCertificate: handleSelectedCertificate,
		handleSetSelectedShipper,
		handleRemoveSelectedShipper,
		handleSetAccordionState,
		handleAddAnimalAdmission,
		handleSetSelectedSpecie,
		handleRemoveSelectedSpecie,
		handleResetAnimalAdmission,
		handleSetIsFromQR,
		handleSetAnimalTransportData,
	} = useReceptionContext();

	const [searchState, setSearchState] = useState<Step1State>(initialState);
	const [canEditDetailsRegisterVehicle, setCanEditDetailsRegisterVehicle] = useState(true)

	const { certificateNumber } = searchState;

	// Get today's date for shippers (usando zona horaria local)
	const today = new Date();
	const currentDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
	const registerVehicleQuery = useGetRegisterVehicleByDate(currentDate);

	// Map register vehicles to shippers format
	const shippers = registerVehicleQuery.data.data
		.filter(item => {
			// Verificar que todos los objetos necesarios existan
			return (
				item.registerVehicle?.shipping?.person &&
				item.registerVehicle?.shipping?.vehicle?.vehicleDetail?.vehicleType &&
				item.registerVehicle?.shipping?.vehicle?.vehicleDetail?.transportType
			);
		})
		.map(item => {
			const shipping = item.registerVehicle!.shipping!;
			const person = shipping.person;
			const vehicle = shipping.vehicle;
			const vehicleDetail = vehicle.vehicleDetail;

			return {
				id: shipping.id,
				person: {
					id: person?.id ?? 0,
					firstName: person?.firstName ?? '',
					lastName: person?.lastName ?? '',
					fullName: person?.fullName ?? '',
					identification: person?.identification ?? '',
					identificationTypeId: person?.identificationTypeId ?? 0,
				},
				vehicle: {
					id: vehicle?.id ?? 0,
					plate: vehicle?.plate ?? '',
					vehicleDetail: {
						vehicleType: {
							id: vehicleDetail?.vehicleType?.id ?? 0,
							name: vehicleDetail?.vehicleType?.name ?? '',
						},
						transportType: {
							id: vehicleDetail?.transportType?.id ?? 0,
							name: vehicleDetail?.transportType?.name ?? '',
						},
					},
				},
				status: true,
				specie: item.species,
				entryTime: item.timeStar || '',
				idDetailsRegisterVehicles: item.id,
			};
		});

	const certificatesQuery = useCertificatesByCode(certificateNumber.searchValue);
	const certificates = certificatesQuery.data?.data || [];

	const debouncedSetSearchParams = useDebouncedCallback((field: keyof Step1State, searchValue: string) => {
		setSearchState(prev => ({ ...prev, [field]: { value: searchValue, searchValue, state: 'enabled' } }));
	}, 500);

	const debounceFields = (field: keyof Step1State, value: string) => {
		debouncedSetSearchParams(field, value);

		setSearchState(prev => ({ ...prev, [field]: { value, searchValue: '', state: 'loading' } }));
	};

	const handleSuccessButton = async (qrData: Certificate | null, closeModal: () => void) => {
		closeModal?.();

		if (!qrData) return;

		handleSetSelectedCertificate(qrData, true);
	};

	const handleSaveAndContinue = async () => {
		if (!selectedCertificate || !selectedShipper) return;

		handleSetAccordionState({ name: 'step1Accordion', accordionState: { btnState: 'loading', isOpen: true } });

		const { id, ...baseCertificateData } = selectedCertificate;

		// Determinar qué idDetailsRegisterVehicles usar:
		// - Si se puede editar (canEditDetailsRegisterVehicle), usar el del transportista seleccionado
		// - Si no se puede editar, mantener el del certificado original
		const idDetailsRegisterVehiclesToUse = canEditDetailsRegisterVehicle
			? (selectedShipper.idDetailsRegisterVehicles ?? selectedCertificate.idDetailsRegisterVehicles)
			: selectedCertificate.idDetailsRegisterVehicles;

		try {
			const response = await updateCertificateService(id, {
				code: baseCertificateData.code ?? '',
				placeOrigin: baseCertificateData?.placeOrigin ?? '',
				issueDate: baseCertificateData.issueDate ?? '',
				quantity: +(baseCertificateData.quantity ?? 0),
				plateVehicle: selectedShipper.plate ?? baseCertificateData.plateVehicle ?? '',
				authorizedTo: baseCertificateData.authorizedTo ?? '',
				originAreaCode: baseCertificateData.originAreaCode ?? '',
				destinationAreaCode: baseCertificateData.destinationAreaCode ?? '',
				shippingsId: selectedShipper.id,
				idOrigin: selectedCertificate.idOrigin ?? 0,
				status: true,
				idDetailsRegisterVehicles: idDetailsRegisterVehiclesToUse,
			});

			const updatedCertificate = response.data;

			setSearchState(initialState);
			handleSelectedCertificate(updatedCertificate);
		} catch (error) {
			handleSetAccordionState({ name: 'step1Accordion', accordionState: { btnState: 'enabled', isOpen: true } });
			return toast.error('Error al guardar los datos. Por favor, inténtalo de nuevo.');
		}

		// 1. Retrieve animal admission data for step 2
		try {
			handleResetAnimalAdmission();

			const settingCertificateBrand = (await getCertBrandByCertificateId(id.toString()))?.data || [];

			// Map to Animal Admission for step 2
			const animalAdmissionMapped = mapToAnimalAdmissions(settingCertificateBrand);

			animalAdmissionMapped.forEach(handleAddAnimalAdmission);

			toast.success('Paso 1 completado correctamente');
		} catch (error) {}

		// 2. Retrieve animal transport data for step 3
		try {
			const conditionTransport = (await getConditionTransportByCertificateId(selectedCertificate?.id.toString() || '')).data;
			handleSetAnimalTransportData({
				id: conditionTransport.id,
				arrivalConditionId: conditionTransport.idConditionsArrival,
				bedTypeId: conditionTransport.idBedType,
				ownMedium: conditionTransport.ownMedium ? 'si' : 'no',
			});
		} catch (error) {
		} finally {
			handleSetAccordionState({ name: 'step1Accordion', accordionState: { isOpen: false, state: 'completed', btnState: 'enabled' } });
			handleSetAccordionState({ name: 'step2Accordion', accordionState: { isOpen: true, state: 'enabled' } });
			handleSetAccordionState({ name: 'step3Accordion', accordionState: { isOpen: false, state: 'enabled' } });
		}

		// 3. Retrieve specie if not set
		try {
			if (selectedSpecie || !selectedCertificate.idDetailsRegisterVehicles) return;

			const registerVehicle = (await getDetailRegisterVehicleById(selectedCertificate.idDetailsRegisterVehicles )).data;

			if (registerVehicle.specie) handleSetSelectedSpecie(registerVehicle.specie);
		} catch (error) {}
	};

	const handleSetSelectedCertificate = async (certificate: Certificate, isFromQR?: boolean) => {
		handleSelectedCertificate(certificate);
		handleSetIsFromQR(!!isFromQR);

		if (!isFromQR) {
			setSearchState(prev => ({
				...prev,
				certificateNumber: { value: certificate.code ?? '', searchValue: certificate.code ?? '', state: 'enabled' },
				plate: { value: certificate.plateVehicle ?? '', searchValue: certificate.plateVehicle ?? '', state: 'enabled' },
			}));
		}

		// PRIMERO: Limpiar la especie anterior y obtener la especie del certificado
		// Obtenemos la especie desde setting-cert-brand que tiene la especie correcta del certificado
		handleRemoveSelectedSpecie(); // Limpiar especie anterior
		
		try {
			// Obtener la especie desde la API de setting-cert-brand
			const settingCertBrandResponse = await getCertBrandByCertificateId(certificate.id.toString());
			const settingCertBrand = settingCertBrandResponse?.data || [];

			// La especie viene en el primer elemento del array
			if (settingCertBrand.length > 0 && settingCertBrand[0].species) {
				const specieFromApi = settingCertBrand[0].species;
				// Crear objeto Specie completo con las propiedades requeridas
				const specieFromCertificate = {
					id: specieFromApi.id,
					name: specieFromApi.name,
					description: specieFromApi.name,
					status: true,
					finishType: [],
				};
				handleSetSelectedSpecie(specieFromCertificate);
			}

			// Validar si se puede editar basado en si ya hay ingresos registrados
			// Si settingCertBrand tiene datos, significa que ya hay ingresos y no se puede editar
			const canEdit = settingCertBrand.length === 0;
			setCanEditDetailsRegisterVehicle(canEdit);
		} catch (error) {
			// Si hay error, permitir edición por defecto
			setCanEditDetailsRegisterVehicle(true);
		}

		// Si el certificado no tiene transportista asociado, limpiar el transportista seleccionado
		if (!certificate?.shippingsId) {
			handleRemoveSelectedShipper();
			return;
		}

		// SEGUNDO: Obtener el transportista asociado al certificado
		try {
			const shipperResponse = await getShippersByIdService(certificate.shippingsId);

			const shipper: ShipperBasicData = {
				id: shipperResponse.data.id,
				personId: shipperResponse.data.person.id,
				firstName: shipperResponse.data.person.firstName,
				lastName: shipperResponse.data.person.lastName,
				identification: shipperResponse.data.person.identification,
				identificationTypeId: shipperResponse.data.person.identificationTypeId.toString(),
				plate: shipperResponse.data.vehicle.plate,
				vehicleId: shipperResponse.data.vehicle.id.toString(),
				vehicleTypeId: shipperResponse.data.vehicle.vehicleDetail.vehicleType.id.toString(),
				vehicleType: shipperResponse.data.vehicle.vehicleDetail.vehicleType.name,
				transportTypeId: shipperResponse.data.vehicle.vehicleDetail.transportType.id.toString(),
				transportType: shipperResponse.data.vehicle.vehicleDetail.transportType.name,
				fullName: `${shipperResponse.data.person.firstName} ${shipperResponse.data.person.lastName}`,
			};

			handleSetSelectedShipper(shipper);
		} catch (error) {
			// Si hay error al obtener el transportista, también limpiarlo
			handleRemoveSelectedShipper();
		}
	};

	const handleChangeStep1 = () =>
		handleSetAccordionState({
			name: 'step1Accordion',
			accordionState: { isOpen: !step1Accordion.isOpen, state: step1Accordion.state === 'completed' ? 'completed' : 'enabled' },
		});

	const successMsg = [];

	if (selectedCertificate?.quantity && selectedCertificate?.placeOrigin)
		successMsg.push(
			`Certificado: ${selectedCertificate?.quantity} ${selectedCertificate?.quantity! > 1 ? 'animales' : 'animal'} ${
				selectedCertificate?.plateVehicle && `• ${selectedCertificate?.plateVehicle}`
			} • ${selectedCertificate?.placeOrigin}`
		);

	if (selectedShipper?.identification && selectedShipper.plate && selectedShipper?.vehicleType)
		successMsg.push(
			`Transportista: ${selectedShipper?.identification} • ${selectedShipper?.plate} • ${toCapitalize(selectedShipper?.vehicleType ?? '')}`
		);

	// Wrapper para limpiar también el transportista al eliminar el certificado
	const handleRemoveCertificate = () => {
		handleRemoveSelectedCertificate();
		handleRemoveSelectedShipper();
	};

	return {
		// data
		selectedSpecie,
		shippers,
		certificates,
		selectedShipper,
		selectedCertificate,
		step1Accordion,
		searchParams: searchState,
		certificatesQuery,
		successMsg,
		isFromQR,
		isLoadingShippers: registerVehicleQuery.isLoading,
		canEditDetailsRegisterVehicle,

		// state handlers
		handleRemoveSelectedCertificate: handleRemoveCertificate,
		handleSetSelectedCertificate,
		handleSetSelectedShipper,
		handleRemoveSelectedShipper,
		handleChangeStep1,
		debounceFields,
		handleSetSelectedSpecie,

		// action to save data
		handleSuccessButton,
		handleSaveAndContinue,
	};
};
