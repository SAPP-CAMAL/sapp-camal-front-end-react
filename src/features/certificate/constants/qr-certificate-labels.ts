/**
 * Labels for QR Certificate Variant 1.
 *
 * Example of a QR certificate using these labels:
 *
 * - CZPM Nº: 2023-12-7474747474
 * - AUTORIZADO A: 0417171717
 * - CODIGÓ ÁREA ORIGEN: 20-0204-00547-00218784
 * - CODIGÓ ÁREA DESTINO: 20-0204-00549-00160228
 * - TOTAL PRODUCTOS: 14
 * - VALIDO HASTA: 2023-12-17 17:59:00
 * - VEHICULO: ABC-1234
 */
export const qrCertificateLabelsVariant1 = {
	czpmNumber: 'CZPM Nº',
	authorizedTo: 'AUTORIZADO A',
	originAreaCode: 'CODIGÓ ÁREA ORIGEN',
	destinationAreaCode: 'CODIGÓ ÁREA DESTINO',
	totalProducts: 'TOTAL PRODUCTOS',
	validUntil: 'VALIDO HASTA',
	vehicle: 'VEHICULO',
} as const;

/**
 * Labels for QR Certificate Variant 2.
 *
 * Example of a QR certificate using these labels:
 *
 * - CSMI_No: 10-2799930
 * - AUTORIZADO_A: 0417171717
 * - CODIGO_AREA_ORIGEN: 100157
 * - CODIGO_AREA_DESTINO: 100103
 * - TOTAL_PRODUCTOS: 7,00
 * - TOTAL_SUBPRODUCTOS: 0,00
 * - VALIDO_HASTA: 26/04/2023 12:00:00
 * - VEHICULO: ABC-1234
 */
export const qrCertificateLabelsVariant2 = {
	csmiNumber: 'CSMI_No',
	authorizedTo: 'AUTORIZADO_A',
	originAreaCode: 'CODIGO_AREA_ORIGEN',
	destinationAreaCode: 'CODIGO_AREA_DESTINO',
	totalProducts: 'TOTAL_PRODUCTOS',
	totalSubProducts: 'TOTAL_SUBPRODUCTOS',
	validUntil: 'VALIDO_HASTA',
	vehicle: 'VEHICULO',
} as const;

/**
 * Labels for QR Certificate Variant 3.
 *
 * Example of a QR certificate using these labels:
 *
 * - No. Certificado: 10100001313131313
 * - Origen: 101313131313 - EMPRESA PUBLICA MUNICIPAL DE FAENAMIENTO Y - Imbabura
 * - Destino: 101313131313 - EMPRESA PUBLICA MUNICIPAL DE FAENAMIENTO Y - Imbabura
 * - Fecha Inicio Vigencia: 2023-12-13 10:20:00.0
 * - Fecha Fin Vigencia: 2023-12-14 00:20:00.0
 * - Placa Transporte: ABC-1234
 * - Total Productos: 3
 */
export const qrCertificateLabelsVariant3 = {
	certificateNumber: 'No. Certificado',
	// authorizedTo: '', // This variant doesn't have this field in qr
	origin: 'Origen',
	destination: 'Destino',
	totalProducts: 'Total Productos',
	startValid: 'Fecha Inicio Vigencia',
	validUntil: 'Fecha Fin Vigencia',
	vehicle: 'Placa Transporte',
} as const;

/**
 * Labels for QR Certificate Variant 4.
 *
 * Example of a QR certificate using these labels:
 *
 * - CZPM-M:  06-3747039
 * - AUTORIZADO_A: 0602563447
 * - CODIGO_AREA_ORIGEN: 060650
 * - CODIGO_AREA_DESTINO: 060162
 * - TOTAL_PRODUCTOS: 2,00
 * - TOTAL_SUBPRODUCTOS: 0,00
 * - VALIDO_HASTA: 24/10/2025 8:45:00
 * - VEHICULO: UBT-0791
 */
export const qrCertificateLabelsVariant4 = {
	czpmmNumber: 'CZPM-M',
	authorizedTo: 'AUTORIZADO_A',
	originAreaCode: 'CODIGO_AREA_ORIGEN',
	destinationAreaCode: 'CODIGO_AREA_DESTINO',
	totalProducts: 'TOTAL_PRODUCTOS',
	totalSubProducts: 'TOTAL_SUBPRODUCTOS',
	validUntil: 'VALIDO_HASTA',
	vehicle: 'VEHICULO',
} as const;
