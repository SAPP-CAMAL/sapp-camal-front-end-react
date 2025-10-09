import { IDetectedBarcode } from '@yudiel/react-qr-scanner';
import { QrCertificateTypes, QrCertificateVariant1, QrCertificateVariant2, QrCertificateVariant3 } from '@/features/certificate/domain';
import { qrCertificateLabelsVariant1, qrCertificateLabelsVariant2, qrCertificateLabelsVariant3 } from '@/features/certificate/constants';

export const parseQrCertificateData = (data: IDetectedBarcode[]): QrCertificateTypes => {
	const rawData = data.at(0)?.rawValue ?? '';

	const parsedData = (rawData.split('\n') ?? []).reduce((data, line) => {
		const [key, value] = line.split(':').map(value => value.trim());
		data[key.toLowerCase()] = value;
		return data;
	}, {} as Record<string, string>);

	const isVariant1 = !!parsedData[qrCertificateLabelsVariant1.czpmNumber.toLowerCase()];

	const isVariant2 = !!parsedData[qrCertificateLabelsVariant2.csmiNumber.toLowerCase()];

	let parsedQrData: QrCertificateTypes;

	if (isVariant1) {
		parsedQrData = {
			czpmNumber: parsedData[qrCertificateLabelsVariant1.czpmNumber.toLowerCase()],
			authorizedTo: parsedData[qrCertificateLabelsVariant1.authorizedTo.toLowerCase()],
			destinationAreaCode: parsedData[qrCertificateLabelsVariant1.destinationAreaCode.toLowerCase()],
			originAreaCode: parsedData[qrCertificateLabelsVariant1.originAreaCode.toLowerCase()],
			totalProducts: +parsedData[qrCertificateLabelsVariant1.totalProducts.toLowerCase()],
			validUntil: parsedData[qrCertificateLabelsVariant1.validUntil.toLowerCase()],
			vehicle: parsedData[qrCertificateLabelsVariant1.vehicle.toLowerCase()],
		} as QrCertificateVariant1;

		return parsedQrData;
	}

	if (isVariant2) {
		parsedQrData = {
			csmiNumber: parsedData[qrCertificateLabelsVariant2.csmiNumber.toLowerCase()],
			authorizedTo: parsedData[qrCertificateLabelsVariant2.authorizedTo.toLowerCase()],
			destinationAreaCode: parsedData[qrCertificateLabelsVariant2.destinationAreaCode.toLowerCase()],
			originAreaCode: parsedData[qrCertificateLabelsVariant2.originAreaCode.toLowerCase()],
			totalProducts: +parsedData[qrCertificateLabelsVariant2.totalProducts.toLowerCase()],
			validUntil: parsedData[qrCertificateLabelsVariant2.validUntil.toLowerCase()],
			vehicle: parsedData[qrCertificateLabelsVariant2.vehicle.toLowerCase()],
		} as QrCertificateVariant2;

		return parsedQrData;
	}

	parsedQrData = {
		certificateNumber: parsedData[qrCertificateLabelsVariant3.certificateNumber.toLowerCase()],
		origin: parsedData[qrCertificateLabelsVariant3.origin.toLowerCase()],
		destination: parsedData[qrCertificateLabelsVariant3.destination.toLowerCase()],
		totalProducts: +parsedData[qrCertificateLabelsVariant3.totalProducts.toLowerCase()],
		validUntil: parsedData[qrCertificateLabelsVariant3.validUntil.toLowerCase()],
		vehicle: parsedData[qrCertificateLabelsVariant3.vehicle.toLowerCase()],
	} as QrCertificateVariant3;

	return parsedQrData;
};
