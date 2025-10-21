/**
 * Tipos y interfaces para el manejo de líneas de producción en postmortem
 */

export type Specie = {
    id: number;
    name: string;
    description: string;
    status: boolean;
};

export type LineItem = {
    id: number;
    name: string;
    description: string;
    status: boolean;
    idSpecie: number;
    specie: Specie;
};

export type GetAllLinesResponse = {
    code: number;
    message: string;
    data: LineItem[];
};
