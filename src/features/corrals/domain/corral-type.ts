export interface CorralType {
  id: number;
  description: string;
  code: string;
  status: boolean;
}

export interface CorralTypeResponse {
  code: number;
  message: string;
  data: CorralType;
}
