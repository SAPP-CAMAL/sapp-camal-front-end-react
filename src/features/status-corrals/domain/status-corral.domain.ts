export interface FinishTypeDailyAdmin {
  id: number;
  name: string;
}

export interface CorralGroupDailyAdmin {
  id: number;
  name: string;
  idFinishType: number | null;
  finishType: FinishTypeDailyAdmin | null;
}

export interface CorralDailyAdmin {
  id: number;
  name: string;
}

export interface StatusCorralDailyAdmin {
  id: number;
  idCorrals: number;
  corral: CorralDailyAdmin;
  quantity: number | null;
  closeCorral: boolean;
  freeCorral: boolean;
  corralGroup: CorralGroupDailyAdmin | null;
}

export interface LineOption {
  id: number;
  name: string;
  description: string;
}
