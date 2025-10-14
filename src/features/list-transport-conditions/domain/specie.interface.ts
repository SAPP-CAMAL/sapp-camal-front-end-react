export interface FinishType {
  id: number;
  name: string;
}

export interface Specie {
  id: number;
  name: string;
  description: string;
  status: boolean;
  finishType: FinishType[];
}

export interface SpeciesResponse {
  code: number;
  message: string;
  data: Specie[];
}
