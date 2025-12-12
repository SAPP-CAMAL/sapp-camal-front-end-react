export interface PartType {
  id: number;
  description: string;
  status: boolean;
}

export interface BodyPart {
  id: number;
  idPartType: number;
  code: string;
  description: string;
  status: boolean;
  partType: PartType;
}

export interface GetBodyPartsResponse {
  code: number;
  message: string;
  data: BodyPart[];
}
