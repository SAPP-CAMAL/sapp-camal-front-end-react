export interface BiosecurityLinesApiResponse {
  code: number;
  message: string;
  data: BiosecurityLines[];
}

export interface BiosecurityLineApiResponse {
    id:                number;
    idBiosecurityLine: number;
    idEquipment:       number;
    status:            boolean;
    equipment:         Equipment;
    biosecurityLines:  BiosecurityLines;
}

export interface BiosecurityLines {
    id:     number;
    idLine: number;
    name:   string;
    status: boolean;
}


export interface Equipment {
    id:              number;
    idEquipmentType: number;
    description:     string;
    status:          boolean;
    equipmentType:   EquipmentType;
}

export interface EquipmentType {
    id:          number;
    description: Description;
    status:      boolean;
}

export enum Description {
    EquipoDeProtección = "EQUIPO DE PROTECCIÓN",
    VestuarioYLenceria = "VESTUARIO Y LENCERIA",
}