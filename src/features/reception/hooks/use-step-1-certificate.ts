import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { toCapitalize } from '@/lib/toCapitalize';
import { ShipperBasicData } from '@/features/shipping/domain';
import { useShippersList } from '@/features/shipping/hooks';
import { Certificate } from '@/features/certificate/domain';
import { useReceptionContext } from './use-reception-context';
import { useCertificateByCode } from '@/features/certificate/hooks';
import { useAnimalAdmissionParams } from './use-animal-admission-params';
import { updateCertificateService } from '@/features/certificate/server/db/certificate.service';
import { readAnimalAdmissionsFromLocalStorage, readSpeciesFromLocalStorage } from '../utils';
import { getShippersByIdService, getDetailRegisterVehicleByIdShippingAndCertificateCodeService } from '@/features/shipping/server/db/shipping.service';

type state = 'enabled' | 'loading';
interface Step1State {
	identification: { value: string; state: state };
	fullName: { value: string; state: state };
	plate: { value: string; state: state };
	certificateNumber: { value: string; state: state };
}

export const useStep1Certificate = () => {
	const {
		step1Accordion,
		selectedShipper,
		animalAdmissionList,
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
	} = useReceptionContext();

	const { searchParams, setSearchParams } = useAnimalAdmissionParams();

	const { identification, fullName, plate, certificateNumber } = searchParams;

	const [searchPState, setSearchPState] = useState<Step1State>({
		identification: { value: identification, state: 'enabled' },
		fullName: { value: fullName, state: 'enabled' },
		plate: { value: plate, state: 'enabled' },
		certificateNumber: { value: certificateNumber, state: 'enabled' },
	});

	useEffect(() => {
		if (identification.length < 1 && fullName.length < 1 && plate.length < 1 && certificateNumber.length < 1)
			setSearchPState({
				identification: { value: '', state: 'enabled' },
				fullName: { value: '', state: 'enabled' },
				plate: { value: '', state: 'enabled' },
				certificateNumber: { value: '', state: 'enabled' },
			});

		if (selectedCertificate?.plateVehicle) {
			debounceFields('plate', selectedCertificate.plateVehicle);
			selectedCertificate.plateVehicle = '';
		}
	}, [identification, fullName, plate, certificateNumber, selectedCertificate]);

	const query = useShippersList(searchParams);

	const shippers = query.data.data.items.filter(shipper => shipper.status);
	const certificateQuery = useCertificateByCode(certificateNumber);
	const certificate = certificateQuery.data?.data;

	const debouncedSetSearchParams = useDebouncedCallback((field: keyof Step1State, value: string) => {
		setSearchParams({ [field]: value });
		setSearchPState(prev => ({ ...prev, [field]: { value, state: 'enabled' } }));
	}, 500);

	const debounceFields = (field: keyof Step1State, value: string) => {
		debouncedSetSearchParams(field, value);
		setSearchPState(prev => ({ ...prev, [field]: { value, state: 'loading' } }));
	};

	const showShippersList = (identification.length > 0 || fullName.length > 0 || plate.length > 0) && !selectedShipper && shippers.length > 0;

	const handleSuccessButton = async (qrData: Certificate | null, closeModal: () => void) => {
		setSearchParams({ certificateNumber: '', plate: '' });
		closeModal?.();

		if (qrData) {
			handleSetSelectedCertificate(qrData);
			handleSetIsFromQR(true); // Mark that this certificate comes from QR
		}

		if (!qrData?.shippingsId) return;

		const shipperResponse = await getShippersByIdService(qrData.shippingsId);
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
		};
		handleSetSelectedShipper(shipper);
	};

	const handleSaveAndContinue = async () => {
		if (!selectedCertificate || !selectedShipper) return;

		handleSetAccordionState({ name: 'step1Accordion', accordionState: { btnState: 'loading' } });

		try {
			const { id, ...baseCertificateData } = selectedCertificate;

			const response = await updateCertificateService(id, {
				code: baseCertificateData.code ?? '',
				placeOrigin: baseCertificateData?.placeOrigin ?? '',
				issueDate: baseCertificateData.issueDate ?? '',
				quantity: +(baseCertificateData.quantity ?? NaN),
				plateVehicle: selectedShipper.plate ?? baseCertificateData.plateVehicle ?? '',
				authorizedTo: baseCertificateData.authorizedTo ?? '',
				originAreaCode: baseCertificateData.originAreaCode ?? '',
				destinationAreaCode: baseCertificateData.destinationAreaCode ?? '',
				shippingsId: selectedShipper.id,
				idOrigin: selectedCertificate.idOrigin ?? 0,
				status: true,
			});

			const updatedCertificate = response.data;

			handleSelectedCertificate(updatedCertificate);

			try {
				const detailResponse = await getDetailRegisterVehicleByIdShippingAndCertificateCodeService(
					selectedShipper.id,
					selectedCertificate.code
				);
				
				if (detailResponse.data?.species) {
					const specieData = {
						id: detailResponse.data.species.id,
						name: detailResponse.data.species.name,
						description: '',
						status: true,
						finishType: [],
						certificateId: selectedCertificate.code
					};
					
					handleSetSelectedSpecie(specieData);
					toast.success(`Especie seleccionada automáticamente: ${detailResponse.data.species.name}`);
				}
			} catch (speciesError) {
				console.error('Error fetching species:', speciesError);
				// If species fetch fails, try to load from localStorage as fallback
				const selectedSpecie = readSpeciesFromLocalStorage().find(specie => specie.certificateId === selectedCertificate.code);
				if (selectedSpecie) handleSetSelectedSpecie(selectedSpecie);
			}

			handleSetAccordionState({ name: 'step1Accordion', accordionState: { isOpen: false, state: 'completed', btnState: 'enabled' } });
			handleSetAccordionState({ name: 'step2Accordion', accordionState: { isOpen: true, state: 'enabled' } });
			handleSetAccordionState({ name: 'step3Accordion', accordionState: { isOpen: false, state: 'enabled' } });

			const animalAdmissionsLocalStorage = readAnimalAdmissionsFromLocalStorage().filter(
				admission => admission.certificateId === selectedCertificate.code
			);

			handleResetAnimalAdmission();

			animalAdmissionsLocalStorage.forEach(handleAddAnimalAdmission);

			toast.success('Paso 1 completado correctamente');
		} catch (error) {
			console.error('Error in handleSaveAndContinue:', error);
			toast.error('Error al guardar. Por favor, intente nuevamente.');
			handleSetAccordionState({ name: 'step1Accordion', accordionState: { btnState: 'enabled' } });
		}
	};

	const handleSetSelectedCertificate = (certificate: Certificate) => {
		handleSelectedCertificate(certificate);
		handleSetIsFromQR(false); // Manual selection, not from QR
		setSearchParams({ certificateNumber: certificate.code ?? '', plate: certificate.plateVehicle ?? '' });
	};

	const handleChangeStep1 = () =>
		handleSetAccordionState({
			name: 'step1Accordion',
			accordionState: { isOpen: !step1Accordion.isOpen, state: step1Accordion.state === 'completed' ? 'completed' : 'enabled' },
		});

	const isLoadingShippers = [searchPState.plate, searchPState.fullName, searchPState.identification].some(field => field.state === 'loading');

	let isLoadingText = 'Cargando ';

	if (searchPState.plate.state === 'loading') isLoadingText += 'placa ';
	if (searchPState.fullName.state === 'loading') isLoadingText += 'nombre ';
	if (searchPState.identification.state === 'loading') isLoadingText += 'cédula ';

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
		shippers,
		certificate,
		selectedShipper,
		selectedCertificate,
		step1Accordion,
		searchParams: searchPState,
		showShippersList,
		isLoadingShippers,
		isLoadingText,
		certificateQuery,
		successMsg,
		isFromQR,
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
