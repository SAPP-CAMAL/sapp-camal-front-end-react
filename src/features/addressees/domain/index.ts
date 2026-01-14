import { CommonHttpResponsePagination } from "@/features/people/domain";

export type FiltersAddressees = {
    fullName?:       string;
    identification?: string;
    provinceId?:     number;
    page?:           number;
    limit?:          number;
    status?:         boolean;
}


export type ResponseAddresseesByFilter = CommonHttpResponsePagination<Addressees>

export interface Addressees {
    id:             number;
    fullName:       string;
    personId?:      number;
    identification: string;
    status:         boolean;
    createdAt:      Date;
    brand:          string;
    addresses:      Address;
}

export interface Address {
    id:         number;
    firstStree: string;
    parish:     string;
    canton:     string;
    province:   string;
}

export interface CreateAdresseesRequest {
    personId: number;
    firstStreet:  string;
    parishId:     number;
}

export interface UpdateAdresseesRequest {
    firstStreet: string;
    parishId:    number;
    addressId:   number;
    status:      boolean;
}