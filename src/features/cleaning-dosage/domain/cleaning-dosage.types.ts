export interface CleaningDosageResponse {
    code:    number;
    message: string;
    data:    CleaningDosage[];
}

export interface CleaningDosage {
    id:               number;
    registrationDate: string;
    idMaterial:       number;
    equipment:        string;
    dose:             string;
    idMethod:         number;
    idEmployee:       number;
    idVeterinary:     number;
    observation:      string;
    status:           boolean;
    employee:         Employee;
    veterinarian:     Veterinarian;
    cleaningMethod:   Datum;
    cleaningMaterial: Datum
}

export interface CleaningDosageRequest {
    equipment:   string;
    dose:        string;
    observation: string;
    idEmployee:  number;
    idMaterial:  number;
    idMethod:    number;
}

export interface Datum {
    id:          number;
    name:        string;
    description: string;
    status:      boolean;
}

export interface ResponseMaterialsOrMethod {
    code: number;
    message: string;
    data: Datum[];
}

export interface Employee {
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

export interface Veterinarian {
    id:   number;
    code: string;
    user: User;
}

export interface User {
    id:     number;
    person: Person;
}