import { SettingCertBrandByCertificateId } from '../../setting-certificate-brand/domain/save-certificate-brand';
import { AnimalAdmissionItem } from '../context/reception-provider';

export const mapToAnimalAdmissions = (admissionList: SettingCertBrandByCertificateId[]): AnimalAdmissionItem[] => {
	return admissionList.map(admission => ({
		randomId: crypto.randomUUID(),
		isOpen: false,
		state: 'created',
		isRetrieveFormData: false,
		animalAdmission: {
			id: admission.id,
			date: admission.slaughterDate,
			males: admission.males,
			females: admission.females,
			observations: admission.commentary,
			isLoadingCorralGroups: false,
			isLoadingCorrals: false,

			...(admission.finishType && {
				finishType: {
					id: admission.finishType?.id ?? 0,
					name: admission.finishType?.name ?? '',
					status: !!admission.finishType?.status,
					idSpecie: admission.finishType?.idSpecie,
				},
			}),

			...(admission.brand && {
				brand: {
					id: admission.brand.id,
					name: admission.brand.name,
					introducerId: admission.brand.introducer.id,
					status: !!admission.brand,
					introducer: {
						id: admission.brand.introducer.id,
						name: admission.brand.introducer.user.person.fullName,
						identification: admission.brand.introducer.user.person.identification,
					},
				},
			}),

			...(admission.corralType && {
				corralType: {
					id: admission.corralType.id,
					description: admission.corralType.description,
					status: !!admission.corralType,
				},
			}),
		},
		// Save data retrieved from API
		retrievedFromApi: {
			brand: admission.brand,
			certificate: admission.certificate,
			species: admission.species,
			statusCorrals: admission.statusCorrals,
			corralGroup: admission.corralGroup,
			detailsCertificateBrand: admission.detailsCertificateBrand,
		},
	}));
};
