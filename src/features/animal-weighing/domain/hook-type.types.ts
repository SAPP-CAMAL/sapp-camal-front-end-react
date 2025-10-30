export interface HookType {
  id: number;
  name: string;
  weightLb: string;
  description: string;
  status: boolean;
  idSpecie: number;
}

export interface GetHookTypesBySpecieResponse {
  code: number;
  message: string;
  data: HookType[];
}
