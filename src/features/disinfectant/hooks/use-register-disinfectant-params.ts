import { parseAsBoolean, parseAsInteger, parseAsString, useQueryStates } from 'nuqs';

export const useRegisterDisinfectantParams = () => {
	const [searchParams, setSearchParams] = useQueryStates(
		{
			page: parseAsInteger.withDefault(1),
			limit: parseAsInteger.withDefault(10),
			identification: parseAsString.withDefault(''),
			fullName: parseAsString.withDefault(''),
			plate: parseAsString.withDefault(''),
			shippingStatus: parseAsBoolean.withDefault(true),
			vehicleStatus: parseAsBoolean.withDefault(true),
		},
		{ history: 'push' }
	);

	return {
		searchParams,
		setSearchParams,
	};
};
