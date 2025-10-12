import { useContext } from 'react';
import { Specie } from '@/features/specie/domain';
import { ShipperBasicData } from '@/features/shipping/domain';
import { Certificate } from '@/features/certificate/domain';
import { AccordionState, AccordionStepKeys, AnimalAdmissionItem, ReceptionContext } from '@/features/reception/context/reception-provider';
import { AnimalTransportForm } from './use-step-3-transport';

export const useReceptionContext = () => {
	const context = useContext(ReceptionContext);

	if (!context) throw new Error('useReceptionContext must be used within a ReceptionProvider.');

	const {
		selectedShipper,
		selectedCertificate,
		step1Accordion,
		step2Accordion,
		step3Accordion,
		animalAdmissionList,
		selectedSpecie,
		isFromQR,
		animalTransportData,

		receptionDispatch,
	} = context;

	const handleSetSelectedShipper = (payload: ShipperBasicData) => {
		receptionDispatch({ type: 'SET_SELECTED_SHIPPER', payload });
	};

	const handleRemoveSelectedShipper = () => {
		receptionDispatch({ type: 'REMOVE_SELECTED_SHIPPER' });
	};

	const handleSetSelectedCertificate = (payload: Certificate) => {
		receptionDispatch({ type: 'SET_SELECTED_CERTIFICATE', payload });
	};

	const handleRemoveSelectedCertificate = () => {
		receptionDispatch({ type: 'REMOVE_SELECTED_CERTIFICATE' });
	};

	const handleSetAccordionState = (payload: { name: AccordionStepKeys; accordionState: Partial<AccordionState> }) => {
		receptionDispatch({ type: 'SET_ACCORDION_STATE', payload });
	};

	const handleAddAnimalAdmission = (payload: AnimalAdmissionItem) => {
		receptionDispatch({ type: 'ADD_ANIMAL_ADMISSION', payload });
	};

	const handleAddNewAnimalAdmission = () => {
		receptionDispatch({
			type: 'ADD_ANIMAL_ADMISSION',
			payload: {
				randomId: crypto.randomUUID(),
				animalAdmission: {},
				state: 'created',
				isOpen: true,
				isRetrieveFormData: false,
			},
		});
	};

	const handleUpdateAnimalAdmission = (payload: AnimalAdmissionItem) => {
		receptionDispatch({ type: 'UPDATE_ANIMAL_ADMISSION', payload });
	};

	const handleRemoveAnimalAdmission = (randomId: string) => {
		receptionDispatch({ type: 'REMOVE_ANIMAL_ADMISSION', payload: { randomId } });
	};

	const handleResetAnimalAdmission = () => {
		receptionDispatch({ type: 'RESET_ANIMAL_ADMISSION' });
	};

	const handleChangeStep2 = () =>
		handleSetAccordionState({
			name: 'step2Accordion',
			accordionState: { isOpen: !step2Accordion.isOpen, state: step2Accordion.state === 'completed' ? 'completed' : 'enabled' },
		});

	const handleSetSelectedSpecie = (payload: Specie) => {
		receptionDispatch({ type: 'SET_SELECTED_SPECIE', payload });
	};

	const handleRemoveSelectedSpecie = () => {
		receptionDispatch({ type: 'REMOVE_SELECTED_SPECIE' });
	};

	const handleResetState = () => {
		receptionDispatch({ type: 'RESET_RECEPTION_STATE' });
	};

	const handleSetIsFromQR = (payload: boolean) => {
		receptionDispatch({ type: 'SET_IS_FROM_QR', payload });
	};

	const handleSetAnimalTransportData = (payload: AnimalTransportForm) => {
		receptionDispatch({ type: 'SET_ANIMAL_TRANSPORT_DATA', payload });
	};

	return {
		// Data
		selectedShipper,
		selectedCertificate,
		step1Accordion,
		step2Accordion,
		step3Accordion,
		animalAdmissionList,
		selectedSpecie,
		isFromQR,
		animalTransportData,

		// Actions
		// Selected shipper
		handleChangeStep2,
		handleSetSelectedShipper,
		handleSetAccordionState,
		handleRemoveSelectedShipper,

		// Animal admission list
		handleAddAnimalAdmission,
		handleAddNewAnimalAdmission,
		handleUpdateAnimalAdmission,
		handleRemoveAnimalAdmission,
		handleResetAnimalAdmission,

		// Selected certificate
		handleSetSelectedCertificate,
		handleRemoveSelectedCertificate,

		// Selected specie
		handleSetSelectedSpecie,
		handleRemoveSelectedSpecie,

		// Condition transport
		handleSetAnimalTransportData,

		// QR flag
		handleSetIsFromQR,

		// Reset state
		handleResetState,
	};
};
