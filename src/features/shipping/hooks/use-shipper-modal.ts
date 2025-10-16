import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { SubmitHandler, useForm } from 'react-hook-form';
import { SHIPPING_LIST_TAG } from '@/features/shipping/constants';
import type { CreateShipperValues, ShipperBasicData, ShipperFormValues } from '@/features/shipping/domain';
import { createShipperService, updateShipperService } from '@/features/shipping/server/db/shipping.service';

type NewShipperFormValues = ShipperFormValues & { open: boolean };

const defaultValues = {
	open: false,
	firstName: '',
	lastName: '',
	identificationTypeId: '',
	identification: '',
	plate: '',
	vehicleTypeId: '',
	transportTypeId: '',
} as NewShipperFormValues;

const btnValue = {
	isSubmitting: {
		create: 'Creando...',
		update: 'Actualizando...',
	},
	submit: {
		create: 'Crear',
		update: 'Actualizar',
	},
};

interface Props {
	shipperData: Partial<ShipperBasicData>;
	onSetShipper?: (shipper?: ShipperBasicData) => void;
}

export const useShipperModal = ({ shipperData = {}, onSetShipper }: Props) => {
	const queryClient = useQueryClient();

	const form = useForm<NewShipperFormValues>({ defaultValues: { ...defaultValues, ...shipperData } });

	const submitType = form.formState.isSubmitting ? 'isSubmitting' : 'submit';
	const createOrUpdateType = Object.keys(shipperData).length === 0 || !shipperData.id ? 'create' : 'update';

	const editAllData = createOrUpdateType === 'update' && shipperData?.identification && shipperData?.plate;
	const addShipper = createOrUpdateType === 'update' && shipperData?.vehicleId && !editAllData;
	const addVehicle = createOrUpdateType === 'update' && shipperData?.personId && !editAllData;

	const handleSaveOrUpdateShipper: SubmitHandler<NewShipperFormValues> = async data => {
		try {
			const { open: _, id, identificationTypeId, transportTypeId, vehicleTypeId, firstName, identification, lastName, plate } = data;

			const requestData: CreateShipperValues = {
				firstName,
				identification,
				lastName,
				plate,
				identificationTypeId: +identificationTypeId,
				transportTypeId: +transportTypeId,
				vehicleTypeId: +vehicleTypeId,
			};

			if (createOrUpdateType === 'create') {
				const response = await createShipperService(requestData);
				form.reset(defaultValues);

				const updatedShipper = response.data;

				onSetShipper?.({
					id: updatedShipper.id,
					personId: updatedShipper.person.id,
					firstName: updatedShipper.person.firstName,
					lastName: updatedShipper.person.lastName,
					identification: updatedShipper.person.identification,
					identificationTypeId: updatedShipper.person.identificationTypeId.toString(),
					plate: updatedShipper.vehicle.plate,
					vehicleId: updatedShipper.vehicle.id.toString(),
					vehicleTypeId: updatedShipper.vehicle.vehicleDetail.vehicleType.id.toString(),
					vehicleType: updatedShipper.vehicle.vehicleDetail.vehicleType.name,
					transportTypeId: updatedShipper.vehicle.vehicleDetail.transportType.id.toString(),
					transportType: updatedShipper.vehicle.vehicleDetail.transportType.name,
					fullName: `${updatedShipper.person.firstName} ${updatedShipper.person.lastName}`,
				});

				toast.success('Transportista creado exitosamente');
			}

			if (addShipper) {
				const updatedData = await createShipperService({
					firstName,
					identification,
					lastName,
					identificationTypeId: +identificationTypeId,
					vehicleId: +(shipperData.vehicleId ?? ''),
				});

				const updatedShipper = updatedData.data;

				onSetShipper?.({
					id: updatedShipper.id,
					personId: updatedShipper.person.id,
					firstName: updatedShipper.person.firstName,
					lastName: updatedShipper.person.lastName,
					identification: updatedShipper.person.identification,
					identificationTypeId: updatedShipper.person.identificationTypeId.toString(),
					plate: updatedShipper.vehicle.plate,
					vehicleId: updatedShipper.vehicle.id.toString(),
					vehicleTypeId: updatedShipper.vehicle.vehicleDetail.vehicleType.id.toString(),
					vehicleType: updatedShipper.vehicle.vehicleDetail.vehicleType.name,
					transportTypeId: updatedShipper.vehicle.vehicleDetail.transportType.id.toString(),
					transportType: updatedShipper.vehicle.vehicleDetail.transportType.name,
					fullName: `${updatedShipper.person.firstName} ${updatedShipper.person.lastName}`,
				});

				toast.success('Agregado transportista exitosamente');
			}

			if (addVehicle) {
				const updatedData = await createShipperService({
					plate,
					vehicleTypeId: +(vehicleTypeId ?? ''),
					transportTypeId: +(transportTypeId ?? ''),
					personId: +(shipperData.personId ?? ''),
				});

				const updatedShipper = updatedData.data;

				onSetShipper?.({
					id: updatedShipper.id,
					personId: updatedShipper.person.id,
					firstName: updatedShipper.person.firstName,
					lastName: updatedShipper.person.lastName,
					identification: updatedShipper.person.identification,
					identificationTypeId: updatedShipper.person.identificationTypeId.toString(),
					plate: updatedShipper.vehicle.plate,
					vehicleId: updatedShipper.vehicle.id.toString(),
					vehicleTypeId: updatedShipper.vehicle.vehicleDetail.vehicleType.id.toString(),
					vehicleType: updatedShipper.vehicle.vehicleDetail.vehicleType.name,
					transportTypeId: updatedShipper.vehicle.vehicleDetail.transportType.id.toString(),
					transportType: updatedShipper.vehicle.vehicleDetail.transportType.name,
					fullName: `${updatedShipper.person.firstName} ${updatedShipper.person.lastName}`,
				});

				toast.success('Transportista actualizado exitosamente');
			}

			if (editAllData) {
				const updatedData = await updateShipperService(id, requestData);
				const updatedShipper = updatedData.data;

				onSetShipper?.({
					id: updatedShipper.id,
					personId: updatedShipper.person.id,
					firstName: updatedShipper.person.firstName,
					lastName: updatedShipper.person.lastName,
					identification: updatedShipper.person.identification,
					identificationTypeId: updatedShipper.person.identificationTypeId.toString(),
					plate: updatedShipper.vehicle.plate,
					vehicleId: updatedShipper.vehicle.id.toString(),
					vehicleTypeId: updatedShipper.vehicle.vehicleDetail.vehicleType.id.toString(),
					vehicleType: updatedShipper.vehicle.vehicleDetail.vehicleType.name,
					transportTypeId: updatedShipper.vehicle.vehicleDetail.transportType.id.toString(),
					transportType: updatedShipper.vehicle.vehicleDetail.transportType.name,
					fullName: `${updatedShipper.person.firstName} ${updatedShipper.person.lastName}`,
				});

				toast.success('Transportista actualizado exitosamente');
			}

			await queryClient.invalidateQueries({ queryKey: [SHIPPING_LIST_TAG] });

			form.setValue('open', false);
		} catch (error: any) {
			const { message } = await error.response.json();

			if (message) return toast.error(message);

			if (editAllData) return toast.error('Ocurrió un error al actualizar el transportista.');
			else if (addShipper) return toast.error('Ocurrió un error al agregar el transportista al vehículo.');
			else if (addVehicle) return toast.error('Ocurrió un error al agregar el vehículo al transportista.');
			else return toast.error('Ocurrió un error al registrar los datos.');
		}
	};

	let title = 'Crear Nuevo Transportista';
	let description = 'Completa los datos para crear un nuevo transportista y vehículo.';

	if (editAllData) title = 'Editar Transportista';
	if (editAllData) description = 'Modifica los datos del transportista seleccionado.';

	if (addShipper) title = 'Agregar Transportista';
	if (addShipper) description = 'Completa los datos del transportista para el vehículo seleccionado.';

	if (addVehicle) title = 'Agregar Vehículo';
	if (addVehicle) description = 'Completa los datos del vehículo para el transportista seleccionado.';

	return {
		// data
		title,
		description,
		form,
		btnMessage: btnValue[submitType][createOrUpdateType],

		// actions
		handleSaveOrUpdateShipper,
	};
};
