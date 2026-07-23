export interface Veterinarian {
  id: number;
  code: string;
  idUser: number;
  fullName?: string;
  authorizedDistribution: boolean;
  status: boolean;
}
