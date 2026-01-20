export interface SettingCertBrandByFilters {
	createdAt: Date;
	id: number;
	codes: null;
	commentary: string;
	males: number;
	females: number;
	slaughterDate: Date;
	idFinishType: number | null;
	certificate: Certificate;
	brand: Brand;
	species: Species;
	statusCorrals: StatusCorrals;
}

interface Brand {
	id: number;
	name: string;
	introducer: Introducer;
}

interface Introducer {
	id: number;
	user: User;
}

interface User {
	id: number;
	person: Person;
}

interface Person {
	id: number;
	fullName: string;
}

interface Certificate {
	id: number;
	code: string;
	quantity: number;
	shipping: Shipping;
}

interface Shipping {
	id: number;
	person: Person;
	vehicle: Vehicle;
}

interface Vehicle {
	id: number;
	plate: string;
}

interface Species {
	id: number;
	name: string;
}

interface StatusCorrals {
	id: number;
	corral: Species;
}
