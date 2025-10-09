import { useQuery } from '@tanstack/react-query';
import { Shipper, ShipperFilter } from '@/features/shipping/domain';
import { SHIPPING_LIST_TAG } from '@/features/shipping/constants';
import { getShippersByFilterService } from '@/features/shipping/server/db/shipping.service';

const initialData = { data: { items: [] as Shipper[], meta: {} }, code: 200, message: 'initial data' };

export const useShippersList = (params: ShipperFilter) => {
	let { page, limit, vehicleStatus, shippingStatus, plate = '', fullName = '', transportType = '', identification = '' } = params;

	plate = plate.trim();
	fullName = fullName.trim();
	identification = identification.trim();

	const query = useQuery({
		queryKey: [SHIPPING_LIST_TAG, params],
		queryFn: () => {
			if (identification.length < 1 && fullName.length < 1 && plate.length < 1) return Promise.resolve(initialData);

			return getShippersByFilterService({
				page,
				limit,
				shippingStatus,
				vehicleStatus,
				...(identification.length > 0 && { identification }),
				...(transportType.length > 0 && { transportType }),
				...(fullName.length > 0 && { fullName }),
				...(plate.length > 0 && { plate }),
			});
		},
		initialData,
	});

	return query;
};
