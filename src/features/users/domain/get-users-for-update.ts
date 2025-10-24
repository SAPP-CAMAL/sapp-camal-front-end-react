export interface GetUsersForUpdate {
	id: number;
	personId: number;
	email: string;
	status: boolean;
	userName: string;
	person: Person;
	veterinarian: Veterinarian;
	userRoles: UserRole[];
}

interface Person {
	id: number;
	firstName: string;
	lastName: string;
	identificationTypeId: number;
	identification: string;
	fullName: string;
	code: string;
	mobileNumber: string;
	genderId: number;
	address: string;
	affiliationDate: null;
	status: boolean;
}

interface UserRole {
	id: number;
	userId: number;
	roleId: number;
	sequence: number;
	activeRole: boolean;
	status: boolean;
}

interface Veterinarian {
	id: number;
	code: string;
}
