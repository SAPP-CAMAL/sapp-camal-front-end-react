export interface BrandFilter {
	fullName: string;
	identification: string;
	name: string;
	idSpecie: number;
}

export interface BrandByFilterResponse {
	id: number;
	name: string;
	description: string;
	introducerId: number;
	status: boolean;
	brandSpecies: BrandSpecie[];
	introducer: {
		id: number;
		user: {
			id: number;
			person: {
				identification: string;
				fullName: string;
			};
		};
	};
}

export interface BrandByFilterMapped {
	id: number;
	name: string;
	description?: string;
	introducerId: number;
	status: boolean;
	introducer: {
		id: number;
		name: string;
		identification?: string;
	};
}

interface BrandSpecie {
	id: number;
	brandId: number;
	specieId: number;
	status: boolean;
}
