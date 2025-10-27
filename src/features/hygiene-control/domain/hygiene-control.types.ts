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


export interface Responsible {
    id:   number;
    code: string;
    user: User;
}

export interface User {
    id:     number;
    person: Person;
}

export interface MappedHygieneControl {
  id:number;
  employeeId: number;
  responsibleId: number;
  employeeFullName: string;
  responsibleFullName: string;
  timeRegister: Date;
  commentary: string;
  detailsHygiene:DetailsHygiene[];
  detailsHygieneGrouped: Record<string, string[]>;
}

export interface EmployeeHygieneControl {
    id:     number;
    person: Person;
}

export interface Person {
    id:             number;
    firstName:      string;
    lastName:       string;
    identification: string;
    fullName:       string;
}


export interface hygieneControlRequest {
    idEmployee:        number;
    settingHygieneIds: number[];
    commentary:        string;
    status:            boolean;
}


/* export interface HygieneControlResponse {
    id:          number;
    idEmployee:  number;
    idEquipment: number;
    commentary:  string;
    status:      boolean;
    employee:    Employee;
} */

export interface Employee {
    id:              number;
    idEquipmentType: number;
    description:     string;
    status:          boolean;
    equipmentType:   EquipmentType;
}

export interface EquipmentType {
    id:              number;
    idEquipmentType: number;
    description:     string;
    status:          boolean;
    equipmentType:   string;
}



export interface HygieneControlResponse {
    code:    number;
    message: string;
    data:    HygieneControl[];
}

export interface HygieneControl {
    id:             number;
    idEmployee:     number;
    idVeterinarian: number;
    commentary:     string;
    status:         boolean;
    detailsHygiene: DetailsHygiene[];
    responsibleFullName: string;
    employeeFullName: string;
    createdAt:Date
    employee:EmployeeHygieneControl
    veterinarian:Responsible
}

export interface DetailsHygiene {
    id:               number;
    idSettingHygiene: number;
    idHygieneControl: number;
    status:           boolean;
    settingHygiene:   SettingHygiene;
}

export interface SettingHygiene {
    id:          number;
    idEquipment: number;
    status:      boolean;
    equipment:   Equipment;
}

export interface Equipment {
    id:              number;
    idEquipmentType: number;
    description:     string;
    status:          boolean;
    equipmentType:   EquipmentType;
}

