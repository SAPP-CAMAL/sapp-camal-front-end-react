export interface IntroducerByIDResponse {
	id: number;
	userId: number;
	fullName: string;
	email: string;
	identification: string;
	status: boolean;
	brands: Brand[];
}

interface Brand {
	id: number;
	name: string;
	description: string;
	status: boolean;
	species: string[];
}
