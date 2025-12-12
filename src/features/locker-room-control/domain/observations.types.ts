export interface ResponseObservations {
    code: number;
    message: string;
    data: Observation[];
}

export interface Observation {
    id:     number;
    name:   string;
    status: boolean;
}