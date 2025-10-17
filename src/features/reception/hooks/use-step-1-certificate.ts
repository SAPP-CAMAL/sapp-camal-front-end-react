import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { toCapitalize } from '@/lib/toCapitalize';
import { mapToAnimalAdmissions } from '../utils';
import { ShipperBasicData } from '@/features/shipping/domain';
import { useShippersList } from '@/features/shipping/hooks';
import { Certificate } from '@/features/certificate/domain';
import { useReceptionContext } from './use-reception-context';
import { useCertificateByCode } from '@/features/certificate/hooks';
import { updateCertificateService } from '@/features/certificate/server/db/certificate.service';
import {
	getDetailRegisterVehicleByIdShippingAndCertificateCodeService,
	getShippersByIdService,
} from '@/features/shipping/server/db/shipping.service';
import { getCertBrandByCertificateId } from '@/features/setting-certificate-brand/server/db/setting-cert-brand.service';
import { getConditionTransportByCertificateId } from '@/features/condition-transport/server/db/condition-transport.service';

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
		isFromQR,
		handleRemoveSelectedCertificate,
		handleSetSelectedCertificate: handleSelectedCertificate,
		handleSetSelectedShipper,
		handleRemoveSelectedShipper,
		handleSetAccordionState,
		handleAddAnimalAdmission,
		handleSetSelectedSpecie,
		handleResetAnimalAdmission,
		handleSetIsFromQR,
		handleSetAnimalTransportData,
	} = useReceptionContext();

	const [searchState, setSearchState] = useState<Step1State>(initialState);
	const [showNoResultsMessage, setShowNoResultsMessage] = useState(false);

	const { identification, fullName, plate, certificateNumber } = searchState;

	const searchFilters = {
		identification: identification.searchValue,
		fullName: fullName.searchValue,
		plate: plate.searchValue,
	};
	const query = useShippersList(searchFilters);

	const shippers = query.data.data.items.filter(shipper => shipper.status);
	const certificateQuery = useCertificateByCode(certificateNumber.searchValue);
	const certificate = certificateQuery.data?.data;

	const debouncedSetSearchParams = useDebouncedCallback((field: keyof Step1State, searchValue: string) => {
		setSearchState(prev => ({ ...prev, [field]: { value: searchValue, searchValue, state: 'enabled' } }));
	}, 500);

	const debounceFields = (field: keyof Step1State, value: string) => {
		debouncedSetSearchParams(field, value);

		setSearchState(prev => ({ ...prev, [field]: { value, searchValue: '', state: 'loading' } }));
	};

	const isSomeFieldsWithValue = [identification.value, fullName.value, plate.value].some(field => field.length > 0);
	const showShippersList = isSomeFieldsWithValue && !selectedShipper;
	const isLoadingShippers = [searchState.plate, searchState.fullName, searchState.identification].some(field => field.state === 'loading');

	// Efecto para mostrar mensaje de "no encontrado" después de 5 segundos
	useEffect(() => {
		if (!isSomeFieldsWithValue || selectedShipper || isLoadingShippers) {
			setShowNoResultsMessage(false);
			return;
		}

		const timer = setTimeout(() => {
			if (shippers.length === 0 && !selectedShipper) {
				setShowNoResultsMessage(true);
			}
		}, 100);

		return () => clearTimeout(timer);
	}, [isSomeFieldsWithValue, selectedShipper, isLoadingShippers, shippers.length]);

	const handleSuccessButton = async (qrData: Certificate | null, closeModal: () => void) => {
		closeModal?.();

		if (!qrData) return;

		handleSetSelectedCertificate(qrData, true);
	};

	const handleSaveAndContinue = async () => {
		if (!selectedCertificate || !selectedShipper) return;

		handleSetAccordionState({ name: 'step1Accordion', accordionState: { btnState: 'loading', isOpen: true } });

		const { id, ...baseCertificateData } = selectedCertificate;

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

		try {
			const registerVehicle = (await getDetailRegisterVehicleByIdShippingAndCertificateCodeService(certificate.shippingsId ?? 0, certificate.code))
				.data;

			if (registerVehicle.species) handleSetSelectedSpecie(registerVehicle.species);
		} catch (error) {}

		if (!certificate?.shippingsId) return;

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
		} catch (error) {}
	};

	const handleChangeStep1 = () =>
		handleSetAccordionState({
			name: 'step1Accordion',
			accordionState: { isOpen: !step1Accordion.isOpen, state: step1Accordion.state === 'completed' ? 'completed' : 'enabled' },
		});

	let isLoadingText = 'Cargando ';

	if (searchState.plate.state === 'loading') isLoadingText += 'placa ';
	if (searchState.fullName.state === 'loading') isLoadingText += 'nombre ';
	if (searchState.identification.state === 'loading') isLoadingText += 'cédula ';

	isLoadingText += '...';

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

	return {
		// data
		shippers,
		certificate,
		selectedShipper,
		selectedCertificate,
		step1Accordion,
		searchParams: searchState,
		showShippersList,
		showNoResultsMessage,
		isLoadingShippers,
		isLoadingText,
		certificateQuery,
		successMsg,
		isFromQR,

		// state handlers
		handleRemoveSelectedCertificate,
		handleSetSelectedCertificate,
		handleSetSelectedShipper,
		handleRemoveSelectedShipper,
		handleChangeStep1,
		debounceFields,

		// action to save data
		handleSuccessButton,
		handleSaveAndContinue,
	};
};
