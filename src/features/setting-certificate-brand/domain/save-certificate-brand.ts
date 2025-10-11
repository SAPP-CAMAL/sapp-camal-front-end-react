export interface SaveCertificateBrand {
	idBrands: number;
	idCorralType: number;
	idCertificate: number;
	idSpecies: number;
	idCorral: number;
	males: number;
	females: number;
	slaughterDate?: string;
	commentary: string;
	status: boolean;
	idFinishType?: number;
	detailsCertificateBrand: RequestDetailsCertificateBrand[];
}

export interface RequestDetailsCertificateBrand {
	idSettingCertificateBrands?: number;
	idProductiveStage: number;
	quantity: number;
	status: boolean;
}

export interface SaveCertificateBrandResponse {
	idBrands: number;
	idCertificate: number;
	status: boolean;
	commentary: string;
	males: number;
	females: number;
	slaughterDate: string;
	idSpecies: number;
	idStatusCorrals: number;
	idCorralType: number;
	userCreated: number;
	userOrigin: string;
	updatedAt: null;
	userUpdated: null;
	codes: null;
	createdAt: string;
	nroVersion: number;
	id: number;
}

export interface SettingCertBrandByCertificateId {
	id: number;
	idBrands: number;
	idCertificate: number;
	codes?: string;
	status: boolean;
	commentary: string;
	males?: number;
	females?: number;
	slaughterDate: string;
	idSpecies: number;
	idStatusCorrals: number;
	idCorralType: number;
	idFinishType?: number;
	brand: {
		id: number;
		name: string;
		introducer: {
			id: number;
			user: {
				id: number;
				person: {
					id: number;
					fullName: string;
				};
			};
		};
	};
	certificate: {
		id: number;
		code: string;
	};
	species: {
		id: number;
		name: string;
	};
	statusCorrals: {
		id: number;
		corral: {
			id: number;
			name: string;
		};
	};
	finishType?: {
		id: number;
		name: string;

		idSpecie?: number;

		status: boolean;
	};

	corralType: {
		id: number;
		description: string;
	};
}

export interface SettingCertBrandByID {
	id: number;
	idBrands: number;
	idCertificate: number;
	codes: string;
	status: boolean;
	commentary: string;
	males: number;
	females: number;
	slaughterDate: Date;
	idSpecies: number;
	idStatusCorrals: number;
	idCorralType: number;
	brand: {
		id: number;
		name: string;
		description: string;
		introducerId: number;
		status: boolean;
	};
	certificate: {
		id: number;
		code: string;
		issueDate: Date;
		placeOrigin: string;
		quantity: number;
		status: boolean;
		plateVehicle: string;
		authorizedTo: string;
		originAreaCode: string;
		destinationAreaCode: string;
		shippingsId: null;
		idOrigin: number;
	};
	detailsCertificateBrand: DetailsCertificateBrand[];
}

export interface DetailsCertificateBrand {
	id: number;
	idSettingCertificateBrands: number;
	idProductiveStage: number;
	quantity: number;
	status: boolean;
}

export interface Brand {
	id: number;
	name: string;
	description: string;
	introducerId: number;
	status: boolean;
}

export interface Certificate {
	id: number;
	code: string;
	issueDate: string;
	placeOrigin: string;
	quantity: number;
	status: boolean;
	plateVehicle: string;
	authorizedTo: string;
	originAreaCode: string;
	destinationAreaCode: string;
	shippingsId: number;
}

export interface SettingCertBrandByIdResponse {
	id: number;
	idBrands: number;
	idCertificate: number;
	codes: string;
	status: boolean;
	commentary: string;
	males: number;
	females: number;
	slaughterDate: string;
	idSpecies: number;
	idStatusCorrals: number;
	idCorralType: number | null;
	brand: Brand;
	certificate: Certificate;
}
