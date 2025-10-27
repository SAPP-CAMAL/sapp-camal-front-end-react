import { EquipmentType } from "./biosecurityLines.types";

export interface LockerRoomControlRequest {
    idEmployee:            number;
    status:                boolean;
    settingEquipmentLines: SettingEquipmentLine[];
    observations:          Observation[];
}

export interface Observation {
    idObservation: number;
}

export interface SettingEquipmentLine {
    idSettingEquipmentLine: number;
}

export interface LockerRoomControl {
    id:                 number;
    idEmployee:         number;
    idResponsible:      number;
    responsibleFullName: string;
    employeeFullName: string;
    status:             boolean;
    timeRegister:       Date;
    employee:           Employee;
    responsible:        Responsible;
    detailsLocker:      DetailsLocker[];
    observationsLocker: ObservationsLocker[];
}

export interface DetailsLocker {
    idDetailsLocker:            number;
    detailsLockerStatus:        boolean;
    idSettingEquipmentLine:     number;
    settingEquipmentLineStatus: boolean;
    idBiosecurityLine:          number;
    biosecurityLine:            BiosecurityLine;
    idEquipment:                number;
    equipment:                  Equipment;
}

export interface BiosecurityLine {
    id:     number;
    idLine: number;
    name:   string;
    status: boolean;
}

export interface Equipment {
    id:                       number;
    description:              string;
    status:                   boolean;
    idEquipmentType:          number;
    equipmentTypeDescription: string;
    equipmentTypeStatus:      boolean;
    equipmentType:   EquipmentType;
}

export interface Employee {
    id:                  number;
    personId:            number;
    positionId:          number;
    suitable:            boolean;
    suitableLimitations: string;
    suitableObservation: string;
    status:              boolean;
}

export interface ObservationsLocker {
    idObservationLocker:     number;
    observationLockerStatus: boolean;
    idObservation:           number;
    observationStatus:       boolean;
    observationName:         string;
}

export interface Responsible {
    id:       number;
    personId: number;
    userName: string;
    email:    string;
    status:   boolean;
}

export interface LockerRoomControlResponse {
    code: number;
    message: string;
    data: LockerRoomControl[];
}



interface ObservationLocker {
  idObservationLocker: number;
  observationName: string;
}

interface LockerRoomControlItem {
  id: number;
  idEmployee: number;
  idResponsible: number;
  timeRegister: string;
  detailsLocker: DetailsLocker[];
  observationsLocker: ObservationLocker[];
}


export interface MappedLockerRoomControl {
  id:number;
  employeeId: number;
  responsibleId: number;
  employeeFullName: string;
  responsibleFullName: string;
  timeRegister: Date;
  observations: string[];
  detailsLockerGrouped: Record<string, string[]>;
  biosecurityLine:number;
  observationsLocker:ObservationLocker[]
}



// Respuesta completa de la API
export interface LockerRoomControlApiResponse {
  code: number;
  message: string;
  data: LockerRoomControl[];
}

