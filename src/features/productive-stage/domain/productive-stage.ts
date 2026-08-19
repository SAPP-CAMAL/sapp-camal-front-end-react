export interface ProductiveStage {
	id:          number;
	name:        string;
	code:        string;
	status:      boolean;
	idSpecies:   number;
	idAnimalSex: number;
}

export type CreateProductiveStageBody = {
	name: string;
	code: string;
	idSpecies: number;
	idAnimalSex: number;
}

export type SearchParamsProductiveStage = {
	page?: number;
	limit?: number;
	name?: string;
	status?: boolean;
}
