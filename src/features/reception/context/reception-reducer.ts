import { Certificate } from '@/features/certificate/domain';
import { Specie } from '@/features/specie/domain';
import { ShipperBasicData } from '@/features/shipping/domain';
import { AnimalTransportForm } from '../hooks/use-step-3-transport';
import { AccordionState, AccordionStepKeys, AnimalAdmissionItem, initialState, ReceptionState } from './reception-provider';

export type ReceptionAction =
	// Selected shipper
	| { type: 'SET_SELECTED_SHIPPER'; payload: ShipperBasicData }
	| { type: 'REMOVE_SELECTED_SHIPPER' }
	// Selected certificate
	| { type: 'SET_SELECTED_CERTIFICATE'; payload: Certificate }
	| { type: 'REMOVE_SELECTED_CERTIFICATE' }
	// Check if the certificate was retrieved from QR
	| { type: 'SET_IS_FROM_QR'; payload: boolean }
	// Accordion control
	| { type: 'SET_ACCORDION_STATE'; payload: { name: AccordionStepKeys; accordionState: Partial<AccordionState> } }
	// Animal admission list control
	| { type: 'ADD_ANIMAL_ADMISSION'; payload: AnimalAdmissionItem }
	| { type: 'UPDATE_ANIMAL_ADMISSION'; payload: AnimalAdmissionItem }
	| { type: 'REMOVE_ANIMAL_ADMISSION'; payload: { randomId: string } }
	| { type: 'RESET_ANIMAL_ADMISSION' }
	// Selected specie
	| { type: 'SET_SELECTED_SPECIE'; payload: Specie }
	| { type: 'REMOVE_SELECTED_SPECIE' }
	// Animal transport data
	| { type: 'SET_ANIMAL_TRANSPORT_DATA'; payload: Partial<AnimalTransportForm> }
	// Reset state
	| { type: 'RESET_RECEPTION_STATE' };

export const uiReducer = (
	receptionState: Omit<ReceptionState, 'receptionDispatch'>,
	action: ReceptionAction
): Omit<ReceptionState, 'receptionDispatch'> => {
	switch (action.type) {
		case 'SET_SELECTED_SHIPPER':
			return { ...receptionState, selectedShipper: action.payload };

		case 'REMOVE_SELECTED_SHIPPER':
			return { ...receptionState, selectedShipper: undefined };

		case 'SET_SELECTED_CERTIFICATE':
			return { ...receptionState, selectedCertificate: action.payload };

		case 'REMOVE_SELECTED_CERTIFICATE':
			return { ...receptionState, selectedCertificate: undefined, isFromQR: false };

		case 'SET_IS_FROM_QR':
			return { ...receptionState, isFromQR: action.payload };

		case 'SET_ACCORDION_STATE':
			const accordion = receptionState[action.payload.name];
			return { ...receptionState, [action.payload.name]: { ...accordion, ...action.payload.accordionState } };

		// Animal admission list control
		case 'ADD_ANIMAL_ADMISSION':
			return { ...receptionState, animalAdmissionList: [action.payload, ...receptionState.animalAdmissionList] };

		case 'UPDATE_ANIMAL_ADMISSION':
			return {
				...receptionState,
				animalAdmissionList: receptionState.animalAdmissionList.map(item => (item.randomId === action.payload.randomId ? action.payload : item)),
			};

		case 'REMOVE_ANIMAL_ADMISSION':
			return {
				...receptionState,
				animalAdmissionList: receptionState.animalAdmissionList.filter(item => item.randomId !== action.payload.randomId),
			};

		case 'RESET_ANIMAL_ADMISSION':
			return { ...receptionState, animalAdmissionList: [] };

		// Specie state
		case 'SET_SELECTED_SPECIE':
			return { ...receptionState, selectedSpecie: action.payload };

		case 'REMOVE_SELECTED_SPECIE':
			return { ...receptionState, selectedSpecie: undefined };

		// Animal transport data
		case 'SET_ANIMAL_TRANSPORT_DATA':
			return { ...receptionState, animalTransportData: { ...receptionState.animalTransportData, ...action.payload } };

		// Reset all state
		case 'RESET_RECEPTION_STATE':
			return initialState;

		default:
			return receptionState;
	}
};
