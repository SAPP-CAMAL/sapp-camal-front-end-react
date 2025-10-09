import { useEffect } from 'react';
import { parseAsString, useQueryStates } from 'nuqs';

export const useAnimalAdmissionParams = () => {
	const [searchParams, setSearchParams] = useQueryStates(
		{
			identification: parseAsString.withDefault(''),
			fullName: parseAsString.withDefault(''),
			plate: parseAsString.withDefault(''),
			certificateNumber: parseAsString.withDefault(''),
			introducerName: parseAsString.withDefault(''),
			introducerIdentification: parseAsString.withDefault(''),
			introducerBrand: parseAsString.withDefault(''),
		},
		{ history: 'push' }
	);

	// Limpiar los parámetros de búsqueda al montar el componente
	useEffect(() => {
		setSearchParams({
			identification: '',
			fullName: '',
			plate: '',
			certificateNumber: '',
			introducerName: '',
			introducerIdentification: '',
			introducerBrand: ''
		}, { history: 'replace' });
	}, []);

	return {
		searchParams,
		setSearchParams,
	};
};
