import { useContext } from 'react';
import { DisinfectantContext } from '../context/disinfectant-provider';
import { DetailRegisterVehicleByDate } from '@/features/vehicles/domain';
import { Certificate } from '@/features/certificate/domain';
import { DailyRegisterFormData } from '../domain';

export const useDailyDisinfectionRegisterContext = () => {
	const context = useContext(DisinfectantContext);

	if (!context) throw new Error('useDailyDisinfectionRegisterContext must be used within a DisinfectantProvider.');

	const { selectedCertificate, dailyDisinfectionRegister, formData, disinfectantDispatch } = context;

	const handleSetDailyDisinfectionRegister = (payload: DetailRegisterVehicleByDate) => {
		disinfectantDispatch({ payload, type: 'SET_DAILY_DISINFECTION_REGISTER' });
	};

	const handleRemoveDailyDisinfectionRegister = () => {
		disinfectantDispatch({ type: 'REMOVE_DAILY_DISINFECTION_REGISTER' });
	};

	const handleSetSelectedCertificate = (payload: Certificate) => {
		disinfectantDispatch({ payload, type: 'SET_SELECTED_CERTIFICATE' });
	};

	const handleRemoveSelectedCertificate = () => {
		disinfectantDispatch({ type: 'REMOVE_SELECTED_CERTIFICATE' });
	};

	const handleSetSelectedFormData = (payload: DailyRegisterFormData) => {
		disinfectantDispatch({ payload, type: 'SET_FORM_DATA' });
	};

	const handleRemoveSelectedFormData = () => {
		disinfectantDispatch({ type: 'REMOVE_FORM_DATA' });
	};

	return {
		// Data
		formData,
		selectedCertificate,
		dailyDisinfectionRegister,

		// Actions
		handleSetSelectedCertificate,
		handleRemoveSelectedCertificate,
		handleSetDailyDisinfectionRegister,
		handleRemoveDailyDisinfectionRegister,
		handleSetSelectedFormData,
		handleRemoveSelectedFormData,
	};
};
