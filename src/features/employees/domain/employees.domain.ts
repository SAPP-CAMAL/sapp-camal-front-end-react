export type Employee = {
    positionId: number;
    personId: number;
    suitable: boolean;
    suitableLimitations: string;
    suitableObservation: string;
    status: boolean;
}

export type CreateEmployeeBody = Omit<Employee, "status">

export type ResponseEmployeesByPerson = {
    code: number;
    message: string;
    data: Datum[];
}

type Datum = {
    id: number;
    personId: number;
    positionId: number;
    suitable: boolean;
    suitableLimitations: string;
    suitableObservation: string;
    status: boolean;
    createdAt: null | Date;
    updatedAt: null | Date;
    position: Position;
}

type Position = {
    id: number;
    name: string;
    code: string;
    description: string;
}