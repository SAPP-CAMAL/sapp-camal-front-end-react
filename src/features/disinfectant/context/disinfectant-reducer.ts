import { Certificate } from '@/features/certificate/domain';
import { DisinfectantState } from './disinfectant-provider';
import { DetailRegisterVehicleByDate } from '@/features/vehicles/domain';
import { DailyRegisterFormData } from '../domain/daily-register-form-data';

export type DisinfectantAction =
	// Selected certificate
	| { type: 'SET_SELECTED_CERTIFICATE'; payload: Certificate }
	| { type: 'REMOVE_SELECTED_CERTIFICATE' }
	// Daily disinfection register
	| { type: 'SET_DAILY_DISINFECTION_REGISTER'; payload: DetailRegisterVehicleByDate }
	| { type: 'REMOVE_DAILY_DISINFECTION_REGISTER' }
	// Form actions
	| { type: 'SET_FORM_DATA'; payload: DailyRegisterFormData }
	| { type: 'REMOVE_FORM_DATA' };

export const uiReducer = (
	disinfectantState: Omit<DisinfectantState, 'disinfectantDispatch'>,
	action: DisinfectantAction
): Omit<DisinfectantState, 'disinfectantDispatch'> => {
	switch (action.type) {
		case 'SET_SELECTED_CERTIFICATE':
			return { ...disinfectantState, selectedCertificate: action.payload };

		case 'REMOVE_SELECTED_CERTIFICATE':
			return { ...disinfectantState, selectedCertificate: undefined };

		case 'SET_DAILY_DISINFECTION_REGISTER':
			return { ...disinfectantState, dailyDisinfectionRegister: action.payload };

		case 'REMOVE_DAILY_DISINFECTION_REGISTER':
			return { ...disinfectantState, dailyDisinfectionRegister: undefined };

		case 'SET_FORM_DATA':
			return { ...disinfectantState, formData: action.payload };

		case 'REMOVE_FORM_DATA':
			return { ...disinfectantState, formData: undefined };

		default:
			return disinfectantState;
	}
};
