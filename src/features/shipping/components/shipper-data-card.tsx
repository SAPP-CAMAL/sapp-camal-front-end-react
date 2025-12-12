import { Car, CircleUserRound, Edit, Trash2 } from 'lucide-react';
import { ShipperModal } from './shipper-modal';
import { Button } from '@/components/ui/button';
import { toCapitalize } from '@/lib/toCapitalize';
import type { ShipperBasicData } from '@/features/shipping/domain';

interface Props {
	shipper?: ShipperBasicData;
	addVehicle?: boolean;
	addShipper?: boolean;
	onSetShipper?: (shipper?: ShipperBasicData) => void;
}

export const ShipperDataCard = ({ shipper, onSetShipper, addShipper, addVehicle }: Props) => {
	if (!shipper) return null;

	return (
		<div className='p-4 bg-green-50 border border-primary rounded-lg'>
			<div className='flex items-start justify-between'>
				<div>
					<h4 className='font-medium text-primary'>{toCapitalize(`${shipper?.firstName} ${shipper?.lastName}`, true)}</h4>
					<div className='text-sm text-primary space-y-1 mt-1'>
						{/* <p>
							<span className='font-medium'>ID:</span> {shipper.id}
						</p> */}
						<p className='capitalize'>
							<span className='font-medium'>Placa:</span> {shipper.plate}
						</p>
						<p>
							<span className='font-medium'>Vehículo:</span>&nbsp;
							{toCapitalize(shipper.vehicleType)}
						</p>
						<p>
							<span className='font-medium'>Transporte</span>&nbsp;
							{toCapitalize(shipper.transportType)}
						</p>
					</div>
				</div>

				{/* Edit and remove buttons */}
				<div className='grid grid-cols-2 gap-2' style={{ direction: 'rtl' }}>
					<div className='flex col-span-2 gap-2'>
						{onSetShipper && (
							<Button variant='ghost' onClick={() => onSetShipper()}>
								<Trash2 />
								Quitar
							</Button>
						)}

						<ShipperModal
							key={shipper.id.toString() + '1'}
							shipperData={shipper}
							onSetShipper={onSetShipper}
							triggerButton={
								<Button variant='ghost'>
									<Edit />
									Editar
								</Button>
							}
						/>
					</div>

					{addVehicle && (
						<ShipperModal
							key={shipper.id.toString() + '2'}
							shipperData={{
								identification: shipper?.identification,
								firstName: shipper?.firstName,
								lastName: shipper?.lastName,
								personId: shipper?.personId,
								identificationTypeId: shipper?.identificationTypeId,
							}}
							onSetShipper={onSetShipper}
							triggerButton={
								<Button variant='default'>
									<Car />
									Agregar Vehículo
								</Button>
							}
						/>
					)}

					{addShipper && (
						<ShipperModal
							key={shipper.id.toString() + '3'}
							shipperData={{
								vehicleTypeId: shipper?.vehicleTypeId,
								transportTypeId: shipper?.transportTypeId,
								plate: shipper?.plate,
								vehicleId: shipper?.vehicleId,
							}}
							onSetShipper={onSetShipper}
							triggerButton={
								<Button variant='default'>
									<CircleUserRound />
									Agregar Transportista
								</Button>
							}
						/>
					)}
				</div>
			</div>
		</div>
	);
};
