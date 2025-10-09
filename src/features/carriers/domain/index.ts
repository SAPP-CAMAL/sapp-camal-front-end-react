import { CommonHttpResponsePagination } from "@/features/people/domain";

export type ResponseCarrierByFilter = CommonHttpResponsePagination<Carrier>

export type MetaPagination = {
    totalItems?: number;
    itemCount?: number;
    itemsPerPage?: number;
    totalPages?: number;
    currentPage?: number;
}


export type FilterCarriers = {
    page?: number;
    limit?: number;
    fullName?: string;
    identification?: string;
    plate?:          string;
    transportType?:  number;
    shippingStatus?: boolean;
    vehicleStatus?:  boolean;
}


export type ResponseValidateDocumentType = {
    isValid: boolean;
    message: string;
}

export interface Carrier {
    id:                         number;
    status:                     boolean;
    person:                     Person;
    vehicle:                    Vehicle;
    transportsProductsChannels: TransportsProductsChannels;
}

export interface Person {
    id:             number;
    firstName:      string;
    lastName:       string;
    fullName:       string;
    identification: string;
    code:           string;
}

export interface TransportsProductsChannels {
    channels:       string;
    products:       string;
    transportModes: string;
}

export interface Vehicle {
    id:              number;
    plate:           string;
    model:           string;
    color:           string;
    brand:           string;
    description:     null;
    manufactureYear: number;
    status:          boolean;
    vehicleDetail:   VehicleDetail;
}

export interface VehicleDetail {
    id:            number;
    status:        boolean;
    transportType: Type;
    vehicleType:   Type;
}

export interface Type {
    id:          number;
    name:        string;
    code:        string;
    description: string;
}

export type ResponseCreateShipping = {
    code: number
    message: string
    data: Shipping
}
export interface CreateShippingRequest {
    vehicleId:                  number;
    personId:                   number;
    transportsProductsChannels?: TransportsProductsChannels;
}

export interface TransportsProductsChannels {
    channels:       string;
    products:       string;
    transportModes: string;
}

export interface Shipping {
    personId:                   number;
    vehicleId:                  number;
    transportsProductsChannels: TransportsProductsChannels;
    userCreated:                number;
    userOrigin:                 string;
    updatedAt:                  null;
    userUpdated:                null;
    createdAt:                  Date;
    nroVersion:                 number;
    id:                         number;
    status:                     boolean;
}