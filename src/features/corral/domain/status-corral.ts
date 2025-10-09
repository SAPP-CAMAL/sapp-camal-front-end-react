export interface StatusCorrals {
  id:           number;
  idCorrals:    number;
  quantity:     number;
  numberRings:  number;
  urlVideo:     string[] | null;
  closeCorral:  boolean;
  freeCorral:   boolean;
  admissionDay: Date;
  status:       boolean;
}
