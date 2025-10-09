import { createContext, useEffect, useReducer } from 'react';
import { Certificate } from '@/features/certificate/domain';
import { ACCORDION_NAMES } from '../constants';
import { Specie } from '@/features/specie/domain';
import { ShipperBasicData } from '@/features/shipping/domain';
import { ReceptionAction, uiReducer } from './reception-reducer';
import { AnimalAdmissionForm } from '../hooks/use-create-update-animal-admission';

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

export interface AnimalAdmissionItem {
	/** Random id not belongs to Animal Admission */
	randomId: string;
	animalAdmission: Partial<AnimalAdmissionForm>;
	isOpen: boolean;
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
	isFromQR: boolean;

	receptionDispatch: React.Dispatch<ReceptionAction>;
}

export const ReceptionContext = createContext<ReceptionState | undefined>(undefined);

export const ReceptionProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, receptionDispatch] = useReducer(uiReducer, initialState);
  useEffect(() => {
    receptionDispatch({ type: 'RESET_RECEPTION_STATE' });
  }, []);

  return (
    <ReceptionContext.Provider value={{ ...state, receptionDispatch }}>
      {children}
    </ReceptionContext.Provider>
  );
};
