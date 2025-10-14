import { parseAsString, useQueryStates } from 'nuqs';

export const useAnimalAdmissionParams = () => {
	const [searchParams, setSearchParams] = useQueryStates({
		identification: parseAsString.withDefault(''),
		fullName: parseAsString.withDefault(''),
		plate: parseAsString.withDefault(''),
		certificateNumber: parseAsString.withDefault(''),
		introducerName: parseAsString.withDefault(''),
		introducerIdentification: parseAsString.withDefault(''),
		introducerBrand: parseAsString.withDefault(''),
	});

	return {
		searchParams,
		setSearchParams,
	};
};
