import { useQuery } from '@tanstack/react-query';
import { DetailRegisterVehicleByDate } from '../domain';
import { DETAIL_REGISTER_VEHICLE_TAG } from '@/features/vehicles/constants';
import { getRegisterVehicleByDate } from '@/features/vehicles/server/db/detail-register-vehicle.service';

export const useGetRegisterVehicleByDate = (date: string) => {
	const query = useQuery({
		queryKey: [DETAIL_REGISTER_VEHICLE_TAG, date],
		queryFn: () => getRegisterVehicleByDate(date),
		initialData: { data: [] as DetailRegisterVehicleByDate[], code: 200, message: 'initial data' },
	});

	return query;
};
