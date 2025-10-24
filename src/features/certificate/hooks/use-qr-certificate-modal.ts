import { toast } from 'sonner';
import { useState } from 'react';
import { IDetectedBarcode } from '@yudiel/react-qr-scanner';
import { Certificate } from '../domain';
import { parseQrCertificateData } from '../utils';
import {
	getCertificateByCodeService,
	saveScannedCertificateService,
	updateCertificateService,
} from '@/features/certificate/server/db/certificate.service';
import { Origin } from '@/features/origin/domain';
import { useAllOrigins } from '@/features/origin/hooks';
import { isBefore, parseISO, startOfDay } from 'date-fns';

type QrState = 'active' | 'loading' | 'invalid' | 'saving';

interface QrModalState {
	isModalOpen: boolean;
	currentTab: number;
	state: QrState;
	qrData: Certificate | null;
	selectedOrigin?: Origin;
	isInvalidOrigin?: boolean;
}

const defaultValues: QrModalState = {
	currentTab: 1,
	isModalOpen: false,
	qrData: null,
	state: 'active',
};

interface Props {
	onSetQrData?: (qrData: Certificate) => void;
}

export const useQrCertificateModal = ({ onSetQrData }: Props) => {
	const [qrModalState, setQrModalState] = useState(defaultValues);
	const query = useAllOrigins();

	const origins = query.data?.data || [];

	// State Handlers
	const setQrState = (state: QrState) => setQrModalState(data => ({ ...data, state }));

	const setIsModalOpen = (isModalOpen: boolean) => setQrModalState(data => ({ ...data, isModalOpen }));

	const setQrData = (qrData: Certificate | null) => {
		setQrModalState(data => ({ ...data, state: 'active', qrData }));
	};

	const setOrigin = (originId: string) => {
		const selectedOrigin = origins.find(origin => origin.id.toString() === originId);
		setQrModalState(data => ({ ...data, selectedOrigin }));
	};

	const setOriginState = (isInvalidOrigin: boolean) => {
		setQrModalState(data => ({ ...data, isInvalidOrigin }));
	};

	const setCurrentTab = (currentTab: number) => {
		if (!currentTab) return;

		setQrModalState(data => ({ ...data, currentTab }));
	};

	const setDefaultValues = () => setQrModalState({ ...defaultValues, isModalOpen: true });

	const closeModal = async () => {
		if (!qrModalState?.qrData?.code) return setIsModalOpen(false);

		const certificate = await getCertificateByCodeService(qrModalState.qrData.code);

		setQrData(certificate.data);
		onSetQrData?.(certificate.data);
		setIsModalOpen(false);
	};

	/**
	 * Scan a valid QR code.
	 * @param data Represents the detected codes from the QR scanner.
	 */
	const handleScanQrData = async (data: IDetectedBarcode[]) => {
		setQrState('loading');

		const parsedQrData = parseQrCertificateData(data);

		const code =
			('czpmNumber' in parsedQrData && parsedQrData.czpmNumber) ||
			('csmiNumber' in parsedQrData && parsedQrData.csmiNumber) ||
			('certificateNumber' in parsedQrData && parsedQrData.certificateNumber) ||
			('czpmmNumber' in parsedQrData && parsedQrData.czpmmNumber);

		if (!code) {
			setQrState('invalid');
			return toast.error('El QR escaneado no es valido');
		}

		try {
			const certificate = await getCertificateByCodeService(code);

			if (certificate.data) {
				setQrData(certificate.data);
				onSetQrData?.(certificate.data);
				setOrigin(certificate.data?.idOrigin?.toString() ?? '');
				setCurrentTab(2);

				return toast.success('Código QR ya se encuentra registrado en el sistema');
			}
		} catch (error) {}

		const isNotValidQr = !parsedQrData.totalProducts || !parsedQrData.validUntil || !code;

		if (isNotValidQr) {
			setQrState('invalid');
			return toast.error('El QR escaneado no es valido');
		}

		try {
			const placeOrigin = ('origin' in parsedQrData && parsedQrData.origin) || '';
			const originAreaCode = ('originAreaCode' in parsedQrData && parsedQrData.originAreaCode) || 'N/A';
			const destinationAreaCode =
				('destinationAreaCode' in parsedQrData && parsedQrData.destinationAreaCode) ||
				('destination' in parsedQrData && parsedQrData.destination) ||
				'N/A';

			const scannedQr = {
				id: NaN,
				code,
				placeOrigin,
				idOrigin: NaN,
				issueDate: parsedQrData.validUntil.split(' ').at(0)?.trim() ?? 'N/A',
				quantity: parsedQrData.totalProducts,
				plateVehicle: parsedQrData.vehicle ?? 'N/A',
				authorizedTo: ('authorizedTo' in parsedQrData && parsedQrData.authorizedTo) || 'N/A',
				originAreaCode,
				destinationAreaCode,
				status: true,
			};

			setQrData(scannedQr);
			setQrState('active');

			toast.success('Código QR escaneado correctamente');
		} catch (error: any) {
			setQrState('active');
			const { data, message } = await error.response.json();
			toast.success(data ?? message ?? 'Ocurrió un error al escanear el código QR');
		}
	};

	const handleSaveQrData = async () => {
		setOriginState(!qrModalState.selectedOrigin);
		if (!qrModalState.qrData) return toast.error('Por favor escanee un código QR válido');
		if (!qrModalState.selectedOrigin) return toast.error('Por favor seleccione una procedencia');
		setQrState('saving');

		// Validate the issue date
		const issueDate = parseISO(qrModalState.qrData.issueDate);
		if (isNaN(issueDate.getTime())) {
			setQrState('active');
			return toast.error('La fecha de emisión no es válida');
		}

		const currentDate = startOfDay(new Date());
		const expirationDate = startOfDay(issueDate);

		if (isBefore(expirationDate, currentDate)) {
			setQrState('active');
			return toast.error('El certificado ha caducado. No se puede procesar un certificado vencido.');
		}

		try {
			const request = {
				code: qrModalState.qrData.code,
				placeOrigin: qrModalState.qrData.placeOrigin || 'N/A',
				issueDate: qrModalState.qrData.issueDate,
				quantity: qrModalState.qrData.quantity,
				plateVehicle: qrModalState.qrData.plateVehicle,
				authorizedTo: qrModalState.qrData.authorizedTo,
				originAreaCode: qrModalState.qrData.originAreaCode,
				destinationAreaCode: qrModalState.qrData.destinationAreaCode,
				idOrigin: qrModalState.selectedOrigin?.id,
				status: true,
			};

			let response;

			if (qrModalState.qrData.id) response = await updateCertificateService(qrModalState.qrData.id, request);
			else response = await saveScannedCertificateService(request);

			const savedQr = response.data;
			savedQr.origin = savedQr.origin || qrModalState.selectedOrigin;
			setQrData(savedQr);
			onSetQrData?.(savedQr);
			setCurrentTab(2);

			toast.success(`Código QR ${qrModalState.qrData.id ? 'actualizado' : 'guardado'} correctamente`);
			setQrState('active');
		} catch (error: any) {
			const { data, message } = await error?.response?.json?.();
			toast.error(data ?? message ?? 'Ocurrió un error al guardar el código QR');
			setQrState('active');
		}
	};

	return {
		// data
		origins,
		qrData: qrModalState.qrData,
		origin: qrModalState.selectedOrigin,
		isInvalidOrigin: qrModalState.isInvalidOrigin,
		isActive: qrModalState.state === 'active',
		isLoading: qrModalState.state === 'loading',
		isSaving: qrModalState.state === 'saving',
		isInvalid: qrModalState.state === 'invalid',
		currentTab: qrModalState.currentTab,
		isModalOpen: qrModalState.isModalOpen,

		// actions
		setQrData,
		setOrigin,
		setQrState,
		closeModal,
		setCurrentTab,
		setIsModalOpen,
		setOriginState,
		handleSaveQrData,
		handleScanQrData,
		setDefaultValues,
	};
};
