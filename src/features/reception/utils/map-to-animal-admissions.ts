import { SettingCertBrandByCertificateId } from '../../setting-certificate-brand/domain/save-certificate-brand';
import { AnimalAdmissionItem } from '../context/reception-provider';

export const mapToAnimalAdmissions = (admissionList: SettingCertBrandByCertificateId[]): AnimalAdmissionItem[] => {
	return admissionList.map(admission => ({
		randomId: crypto.randomUUID(),
		isOpen: false,
		state: 'created',
		animalAdmission: {
			id: admission.id,
			date: admission.slaughterDate,
			males: admission.males,
			females: admission.females,
			observations: admission.commentary,
			isLoadingCorralGroups: false,
			isLoadingCorrals: false,

			finishType: {
				id: admission.finishTypeId ?? 0,
				name: '',
				status: true,
				idSpecie: admission.idSpecies,
			},
		},
	}));
};
