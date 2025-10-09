export interface Specie {
	id: number;
	name: string;
	description: string;
	status: boolean;
	finishType: FinishType[];
}

interface FinishType {
	id: number;
	name: string;
}
