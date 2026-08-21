export interface FairTicket {
  id: number;
  code: string;
  reclaimed: boolean;
  reclaimedAt?: string;
  productiveStageId: number;
  productiveStage?: {
    id: number;
    name: string;
  };
  createdAt?: string;
}

export interface CreateFairTicketBody {
  code: string;
  productiveStageId: number;
}

/** Datos que se muestran en el ticket impreso y en su vista previa. */
export interface FairTicketPreviewData {
  code: string;
  id?: number;
  species: string;
  date: string;
}

export type RegisterStatus = "success" | "error";

export interface RegisterResult {
  code: string;
  status: RegisterStatus;
  message: string;
}

export type VerifyStatus = "validated" | "not_found" | "already_claimed" | "error";

export interface VerifyResult {
  code: string;
  status: VerifyStatus;
  message: string;
}
