import { toast } from 'sonner';
import { SubmitHandler, useForm } from 'react-hook-form';
import type { Certificate } from '../domain';
import { useAllOrigins } from '@/features/origin/hooks';
import { saveScannedCertificateService, updateCertificateService } from '../server/db/certificate.service';

type CertificateFormValues = Partial<Omit<Certificate, 'idOrigin'> & { open: boolean; idOrigin: string }>;

const defaultValues: CertificateFormValues = {
	open: false,
	code: '',
	idOrigin: '',
	quantity: 0,
	commentary: '',
	issueDate: (() => {
		const today = new Date();
		return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}T${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}:${String(today.getSeconds()).padStart(2, '0')}`;
	})(),
};

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
	certificate: Partial<Certificate>;
	onSetCertificate?: (certificate: Certificate) => void;
}

export const useCertificateModal = ({ certificate = {}, onSetCertificate }: Props) => {
	const query = useAllOrigins();

	const origins = query.data.data;

	const form = useForm<CertificateFormValues>({
		defaultValues: {
			...defaultValues,
			...certificate,
			idOrigin: certificate.idOrigin?.toString(),
		},
	});

	const submitType = form.formState.isSubmitting ? 'isSubmitting' : 'submit';
	const createOrUpdateType = Object.keys(certificate).length === 0 ? 'create' : 'update';

	const handleSaveOrUpdateCertificate: SubmitHandler<CertificateFormValues> = async data => {
		try {
			const { open: _, id, ...baseCertificateData } = data;

			const placeOrigin = origins?.find(origin => origin.id === +baseCertificateData.idOrigin!);

			if (createOrUpdateType === 'create') {
				const response = await saveScannedCertificateService({
					idOrigin: placeOrigin ? +placeOrigin.id : 0,
					code: baseCertificateData.code ?? '',
					placeOrigin: placeOrigin?.description ?? '',
					issueDate: baseCertificateData.issueDate ?? '',
					quantity: +(baseCertificateData.quantity ?? NaN),
					plateVehicle: baseCertificateData.plateVehicle ?? '',
					authorizedTo: baseCertificateData.authorizedTo ?? '',
					originAreaCode: baseCertificateData.originAreaCode ?? '',
					destinationAreaCode: baseCertificateData.destinationAreaCode ?? '',
					status: true,
				});

				const saveCertificate = { ...response.data, idOrigin: response.data.idOrigin ?? (placeOrigin ? +placeOrigin.id : 0) };

				onSetCertificate?.(saveCertificate);

				form.reset(defaultValues);
				toast.success('Certificado creado exitosamente');
			} else {
				const response = await updateCertificateService(id!, {
					idOrigin: placeOrigin ? +placeOrigin.id : 0,
					code: baseCertificateData.code ?? '',
					placeOrigin: placeOrigin?.description ?? '',
					issueDate: baseCertificateData.issueDate ?? '',
					quantity: +(baseCertificateData.quantity ?? NaN),
					plateVehicle: baseCertificateData.plateVehicle ?? '',
					authorizedTo: baseCertificateData.authorizedTo ?? '',
					originAreaCode: baseCertificateData.originAreaCode ?? '',
					destinationAreaCode: baseCertificateData.destinationAreaCode ?? '',
					commentary: baseCertificateData.commentary ?? '',
					status: true,
				});

				const updatedCertificate = { ...response.data, idOrigin: response.data.idOrigin ?? (placeOrigin ? +placeOrigin.id : 0) };

				onSetCertificate?.(updatedCertificate);

				toast.success('Certificado actualizado exitosamente');
			}

			form.setValue('open', false);
		} catch (error: any) {
			const { data, statusCode } = await error.response.json();

			if (data && statusCode !== 500) return toast.error(data);

			if (createOrUpdateType === 'create') return toast.error('Ocurrió un error al crear el certificado.');
			else if (createOrUpdateType === 'update') return toast.error('Ocurrió un error al actualizar el certificado.');
			else return toast.error('Ocurrió un error al registrar los datos.');
		}
	};

	let title = 'Crear Nuevo Certificado';
	let description = 'Complete la información para crear un nuevo certificado de ingreso de animales.';

	if (createOrUpdateType === 'update') title = 'Editar Certificado';
	if (createOrUpdateType === 'update') description = 'Modifique la información del certificado seleccionado.';

	return {
		// data
		title,
		description,
		form,
		btnMessage: btnValue[submitType][createOrUpdateType],

		// actions
		handleSaveOrUpdateCertificate,
	};
};
