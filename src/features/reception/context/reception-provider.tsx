import { createContext, useReducer } from 'react';
import { Certificate } from '@/features/certificate/domain';
import { ACCORDION_NAMES } from '../constants';
import { Specie } from '@/features/specie/domain';
import { ShipperBasicData } from '@/features/shipping/domain';
import { ReceptionAction, uiReducer } from './reception-reducer';
import { AnimalAdmissionForm } from '../hooks/use-create-update-animal-admission';
import { AnimalTransportForm } from '../hooks/use-step-3-transport';
import { DetailsCertificateBrand } from '@/features/setting-certificate-brand/domain';

export const initialState: Omit<ReceptionState, 'receptionDispatch'> = {
	animalAdmissionList: [],
	step1Accordion: { name: ACCORDION_NAMES.STEP_1, isOpen: true, state: 'enabled', btnState: 'enabled' },
	step2Accordion: { name: ACCORDION_NAMES.STEP_2, isOpen: false, state: 'disabled', btnState: 'enabled' },
	step3Accordion: { name: ACCORDION_NAMES.STEP_3, isOpen: false, state: 'disabled', btnState: 'enabled' },
	isFromQR: false,
};

export type AccordionStepKeys = 'step1Accordion' | 'step2Accordion' | 'step3Accordion';

export interface AccordionState {
	name: AccordionStepKeys;
	isOpen: boolean;
	state: 'disabled' | 'enabled' | 'completed';
	btnState: 'enabled' | 'loading' | 'error';
}

export interface RetrievedFromApi {
	brand: { id: number; name: string };
	certificate: { id: number; code: string };
	species: { id: number; name: string };
	statusCorrals: { id: number; corral: { id: number; name: string } };
	corralGroup: { id: number; name: string };
	detailsCertificateBrand: DetailsCertificateBrand[];
}
export interface AnimalAdmissionItem {
	/** Random id not belongs to Animal Admission */
	randomId: string;
	animalAdmission: Partial<AnimalAdmissionForm>;
	retrievedFromApi?: RetrievedFromApi;
	isOpen: boolean;
	isRetrieveFormData: boolean;
	state: 'created' | 'updated' | 'deleting';
}

export interface ReceptionState {
	step1Accordion: AccordionState;
	step2Accordion: AccordionState;
	step3Accordion: AccordionState;
	selectedShipper?: ShipperBasicData;
	selectedCertificate?: Certificate;
	animalAdmissionList: AnimalAdmissionItem[];
	selectedSpecie?: Specie;
	animalTransportData?: AnimalTransportForm;
	isFromQR: boolean;
	receptionDispatch: React.Dispatch<ReceptionAction>;
}

export const ReceptionContext = createContext<ReceptionState | undefined>(undefined);

export const ReceptionProvider = ({ children }: { children: React.ReactNode }) => {
	const [state, receptionDispatch] = useReducer(uiReducer, initialState);

	return <ReceptionContext.Provider value={{ ...state, receptionDispatch }}>{children}</ReceptionContext.Provider>;
};
