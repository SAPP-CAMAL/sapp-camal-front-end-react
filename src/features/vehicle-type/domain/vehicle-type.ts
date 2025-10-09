export interface VehicleType {
	id: number;
	code: string;
	name: string;
	description: string;
	catalogueTypeId: number;
	status: boolean;
	parentId: number | null;
}
