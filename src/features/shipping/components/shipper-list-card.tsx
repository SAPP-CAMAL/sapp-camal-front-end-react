import { Button } from '@/components/ui/button';
import { toCapitalize } from '@/lib/toCapitalize';
import { Shipper } from '../domain';
import { cn } from '@/lib/utils';
import type { ShipperBasicData } from '@/features/shipping/domain';

interface Props {
	className?: string;
	shippers?: Shipper[];
	onSelectShipper: (shipper: ShipperBasicData) => void;
}

const defaultClassName = 'max-h-60 overflow-y-auto space-y-2 border rounded-lg p-2 mt-2';

export const ShipperListCard = ({ className, shippers = [], onSelectShipper }: Props) => {
	return (
		<div className={cn(defaultClassName, className)}>
			{shippers.map(shipper => (
				<div
					key={shipper.id}
					className='p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors'
					onClick={() =>
						onSelectShipper({
							id: shipper.id,
							personId: shipper.person.id,
							firstName: shipper.person.firstName,
							lastName: shipper.person.lastName,
							identification: shipper.person.identification,
							identificationTypeId: shipper.person.identificationTypeId.toString(),
							plate: shipper.vehicle.plate,
							vehicleId: shipper.vehicle.id.toString(),
							vehicleTypeId: shipper.vehicle.vehicleDetail.vehicleType.id.toString(),
							vehicleType: shipper.vehicle.vehicleDetail.vehicleType.name,
							transportTypeId: shipper.vehicle.vehicleDetail.transportType.id.toString(),
							transportType: shipper.vehicle.vehicleDetail.transportType.name,
						})
					}
				>
					<div className='flex items-center justify-between'>
						<div>
							<h4 className='font-medium'>{toCapitalize(shipper?.person?.fullName, true)}</h4>
							<div className='text-sm text-muted-foreground'>
								<p>
									{shipper?.person?.identification} - {shipper?.vehicle?.plate}
								</p>
								<p>
									{toCapitalize(`${shipper?.vehicle?.vehicleDetail?.vehicleType?.name} (${shipper?.vehicle?.vehicleDetail?.transportType?.name})`)}
								</p>
							</div>
						</div>

						<Button variant='outline'>Seleccionar</Button>
					</div>
				</div>
			))}
		</div>
	);
};
