export interface HookType {
  id: number;
  name: string;
  weight: string;
  description: string;
  status: boolean;
  idSpecie: number;
}

export interface GetHookTypesBySpecieResponse {
  code: number;
  message: string;
  data: HookType[];
}
