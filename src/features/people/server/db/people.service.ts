import { http } from "@/lib/ky";
import { CommonHttpResponseSingle, FilterPeople, Person, PersonValidateDocumentResponse, ResponseCreatePerson, ResponseFindPersonByIdentificationOrFullName, ResponsePeopleByFilter, ResponseValidateDocumentType } from "@/features/people/domain";

export function getPeopleByFilterService(filters: FilterPeople = {}): Promise<ResponsePeopleByFilter> {
    return http.post("v1/1.0.0/person/person-by-filter", {
        next: {
            tags: ["people"],
        },
        json: filters
    }).json<ResponsePeopleByFilter>()
}

export function createPersonService(body: Omit<Person, "id" | "gender" | "identificationType">): Promise<ResponseCreatePerson> {
    return http.post("v1/1.0.0/person", {
        json: body
    }).json<ResponseCreatePerson>()
}

export function updatePersonService(personId: number, body: Partial<Omit<Person, "id" | "gender" | "identificationType">>): Promise<ResponseCreatePerson> {
    return http.patch(`v1/1.0.0/person/${personId}`,
        { json: body }
    ).json()
}

export function validateDocumentTypeService(codeDocument: string, identification: string) {
    return http.get("v1/1.0.0/person/validate-document-type", {
        searchParams: {
            codeDocument,
            identification
        }
    }).json<ResponseValidateDocumentType>()
}

export function getPersonByIdentificationOrFullNameService(query: { identification?: string, fullName?: string }): Promise<ResponseFindPersonByIdentificationOrFullName> {
    return http.get("v1/1.0.0/person/by-identification", {
        searchParams: {
            ...(query.identification && { identification: query.identification }),
            ...(query.fullName && { fullName: query.fullName })
        }
    }).json()
}

export function personValidateDocument(identification: string) {
    return http.get("v1/1.0.0/person/validate", {
        searchParams: { identification }
    }).json<CommonHttpResponseSingle<PersonValidateDocumentResponse>>()
}
