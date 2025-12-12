type CommonHttp = {
    code: number
    message: string
}


export type CommonHttpResponsePagination<T> = CommonHttp & {
    data: {
        items: T[];
        meta: MetaPagination;
    }
}

export type CommonHttpResponse<T> = CommonHttp & {
    data: T[]
}

export type CommonHttpResponseSingle<T> = CommonHttp & {
    data: T
}
export type CreateOrUpdateHttpResponse<T> = CommonHttp & {
    data: T;
};

export type ResponsePeopleByFilter = CommonHttpResponsePagination<Person>

export type MetaPagination = {
    totalItems?: number;
    itemCount?: number;
    itemsPerPage?: number;
    totalPages?: number;
    currentPage?: number;
}

export type Person = {
    id: number;
    firstName?: string;
    lastName?: string;
    identificationTypeId?: number;
    identification?: string;
    fullName?: string;
    code?: string;
    mobileNumber?: string;
    genderId?: number;
    address?: string;
    affiliationDate?: string | Date;
    gender?: Gender;
    identificationType?: Gender;
    status?: boolean;
    isEmployee?: boolean;
    email?:string;
    idEmployee?:number;
}

type Gender = {
    id: number;
    name: string;
    code: string;
    description: string;
}

export type FilterPeople = {
    page?: number;
    limit?: number;
    fullName?: string;
    identificacion?: string;
    status?: boolean;
    isEmployee?: boolean;
}


export type ResponseValidateDocumentType = CommonHttpResponseSingle<{ isValid: boolean; message: string; }>;

export type ResponseCreatePerson = {
    code: number
    message: string
    data: Person
}

interface FindPersonByIdentificationOrFullName {
    id: number;
    firstName: string;
    lastName: string;
    identificationTypeId: number;
    identification: string;
    fullName: string;
    code: string;
    mobileNumber: string;
    genderId: number;
    address: string;
    status: boolean;
    affiliationDate: string;
    gender: null;
    isEmployee: boolean;
    identificationType: null;
}


export type ResponseFindPersonByIdentificationOrFullName = CommonHttpResponse<FindPersonByIdentificationOrFullName>



export interface PersonValidateDocumentResponse {
    identityCard:       string;
    fullName:           string;
    firstName:          string;
    lastName:           string;
    gender:             string;
    dateOfBirth:        string;
    civilStatus:        string;
    conyuge:            string;
    nationality:        string;
    identificationDate: string;
    residencePlace:     string;
    residenceStreet:    string;
    residenceNumber:    string;
    motherName:         string;
    fatherName:         string;
    birthPlace:         string;
    educationLevel:     string;
    profession:         string;
}
