import { createContext, useReducer } from 'react';
import { Certificate } from '@/features/certificate/domain';
import { DailyRegisterFormData } from '../domain';
import { DisinfectantAction, uiReducer } from './disinfectant-reducer';
import type { DetailRegisterVehicleByDate } from '@/features/vehicles/domain';

const initialState = {};

export interface DisinfectantState {
	selectedCertificate?: Certificate;
	dailyDisinfectionRegister?: DetailRegisterVehicleByDate;
	formData?: DailyRegisterFormData;

	disinfectantDispatch: React.Dispatch<DisinfectantAction>;
}

export const DisinfectantContext = createContext<DisinfectantState | undefined>(undefined);

export const DisinfectantProvider = ({ children }: { children: React.ReactNode }) => {
	const [disinfectant, disinfectantDispatch] = useReducer(uiReducer, initialState);

	return <DisinfectantContext value={{ ...disinfectant, disinfectantDispatch }}>{children}</DisinfectantContext>;
};
