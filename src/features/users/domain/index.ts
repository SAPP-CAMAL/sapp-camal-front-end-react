import { CommonHttpResponsePagination, Person } from "@/features/people/domain";

export interface GetUserByFilterQuery {
    page?: number;
    limit?: number;
    fullName?: string;
    email?: string;
    userName?: string;
    identification?: string;
}

type PersonUserFilter = Pick<Person, 'id' | 'identificationTypeId' | 'identification' | 'fullName' | 'code'>;


interface UserFilter {
    id: number;
    userName: string;
    email: string;
    person: PersonUserFilter;
}



export interface CreateUserInput {
    personId: number;
    email: string;
    userName: string;
    password: string;
    roles: number[];
}

export type ResponseGetUserByFilter = CommonHttpResponsePagination<UserFilter>;