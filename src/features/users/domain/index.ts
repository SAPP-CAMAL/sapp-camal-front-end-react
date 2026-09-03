import { CommonHttpResponsePagination, Person } from "@/features/people/domain";

export interface GetUserByFilterQuery {
    page?: number;
    limit?: number;
    fullName?: string;
    email?: string;
    userName?: string;
    identification?: string;
    status?: boolean;
}

type PersonUserFilter = Pick<Person, 'id' | 'identificationTypeId' | 'identification' | 'fullName' | 'code'>;


export interface UserFilter {
    id: number;
    userName: string;
    email: string;
    status: boolean;
    person: PersonUserFilter;
}



export interface CreateUserInput {
    personId: number;
    email: string;
    userName: string;
    password: string;
    roles: number[];
}

export type UpdateUserInput = Pick<CreateUserInput, 'email' | 'userName'> & { status?: boolean; roles: { id: number, status: boolean }[] };

export type ResponseGetUserByFilter = CommonHttpResponsePagination<UserFilter>;