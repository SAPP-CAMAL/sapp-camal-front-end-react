import { toast } from 'sonner';
import { CircleCheckBig, FileX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Certificate } from '@/features/certificate/domain';
import { QrCertificateModal } from '@/features/certificate/components';
import { useDailyDisinfectionRegisterContext } from '../hooks';
import {
	getDetailRegisterVehicleByIdShippingAndCertificateCodeService,
	getShippersByIdService,
} from '@/features/shipping/server/db/shipping.service';
import { DailyRegisterFormData } from '../domain';

export const RegisterDisinfectantPageHeader = () => {
	const { selectedCertificate, handleSetSelectedCertificate, handleRemoveSelectedCertificate, handleSetSelectedFormData } =
		useDailyDisinfectionRegisterContext();

	const handleSuccessButton = async (qrData: Certificate | null, closeModal: () => void) => {
		if (qrData) handleSetSelectedCertificate(qrData);

		if (!qrData?.shippingsId) return closeModal?.();
		try {
			const shipperResponse = (await getShippersByIdService(qrData.shippingsId)).data;
			const registerVehicle = (await getDetailRegisterVehicleByIdShippingAndCertificateCodeService(shipperResponse.id, qrData.code)).data;

			const registerVehicleData = {
				id: registerVehicle.id,
				dosage: registerVehicle.dosage,
				disinfectant: registerVehicle.disinfectant.id.toString(),
				admissionApplicationTime: registerVehicle.timeStar,
				departureApplicationTime: registerVehicle.timeEnd ?? '',
				observations: registerVehicle.commentary,
				transportedSpecie: registerVehicle.species.id,
				shipper: {
					personId: shipperResponse.person.id,
					id: shipperResponse.id,
					firstName: shipperResponse.person.firstName ?? '',
					lastName: shipperResponse.person.lastName ?? '',
					identification: shipperResponse.person.identification ?? '',
					identificationTypeId: shipperResponse.person.identificationTypeId.toString() ?? '',
					plate: shipperResponse.vehicle.plate ?? '',
					transportType: shipperResponse.vehicle.vehicleDetail.transportType.name ?? '',
					transportTypeId: shipperResponse.vehicle.vehicleDetail.transportType.id.toString() ?? '',
					vehicleId: shipperResponse.vehicle.vehicleDetail.id.toString() ?? '',
					vehicleType: shipperResponse.vehicle.vehicleDetail.vehicleType.name ?? '',
					vehicleTypeId: shipperResponse.vehicle.vehicleDetail.vehicleType.id.toString() ?? '',
				},
				fullName: '',
				identification: '',
				plate: '',
			} as DailyRegisterFormData;

			handleSetSelectedFormData(registerVehicleData);
		} catch (error) {
			toast.error('Error al obtener los datos del transportista y el vehículo');
		} finally {
			closeModal?.();
		}
	};

	return (
		<section className='mb-4 flex flex-col md:flex-row gap-2 justify-between'>
			{/* Title and scanner qr button */}
			<div>
				<p className='mt-1 font-bold'>Registro Diario Ingreso Vehículos y Producto Utilizado en el Arco de Desinfección</p>
			</div>

			<div className='flex justify-end items-center gap-2'>
				{/* Remove certificate button */}
				{selectedCertificate && (
					<Button variant='destructive' onClick={() => handleRemoveSelectedCertificate()}>
						<FileX />
						Quitar Certificado Escaneado
					</Button>
				)}

				{/* QR Certificate Modal */}
				<QrCertificateModal
					renderSuccessButton={({ qrData, closeModal }) => (
						<Button type='button' className='bg-green-600 hover:bg-green-700' onClick={() => handleSuccessButton(qrData, closeModal)}>
							<CircleCheckBig />
							Finalizar
						</Button>
					)}
				/>
			</div>
		</section>
	);
};
