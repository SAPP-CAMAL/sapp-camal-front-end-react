export interface ConditionTransportRequest {
  idCertificate:       number;
  idBedType:           number;
  idConditionsArrival: number;
  ownMedium:           boolean;
  description?:        string;
  status:              boolean;
}
export interface ConditionTransportResponse {
  idBedType:           number;
  idCertificate:       number;
  idConditionsArrival: number;
  ownMedium:           boolean;
  status:              boolean;
  userCreated:         number;
  userOrigin:          string;
  updatedAt:           null;
  userUpdated:         null;
  createdAt:           Date;
  nroVersion:          number;
  id:                  number;
}
