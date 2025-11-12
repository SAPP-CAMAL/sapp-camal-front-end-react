import { http } from "@/lib/ky";
import { CreateEmployeeBody, Employee, ResponseEmployeesByPerson } from "../../domain/employees.domain";

export function createEmployeeService(body: CreateEmployeeBody): Promise<Employee> {
    return http.post("v1/1.0.0/employee", {
        json: body
    }).json<Employee>()
}

export function updateEmployeeService(employeeId: number, body: Partial<CreateEmployeeBody>): Promise<Employee> {
    return http.patch(`v1/1.0.0/employee/${employeeId}`, {
        json: body
    }).json<Employee>()
}

export function getEmployeesByPersonIdService(personId: number): Promise<ResponseEmployeesByPerson> {
    return http.get("v1/1.0.0/employee/by-person-id", {
        searchParams: {
            personId
        }
    }).json<ResponseEmployeesByPerson>()
}

export function getEmployeesByRoleIdService(roleId: number): Promise<ResponseEmployeesByPerson> {
    return http.get("v1/1.0.0/employee/by-role-id", {
        searchParams: {
            roleId
        }
    }).json<ResponseEmployeesByPerson>()
}

export function deleteEmployeeService(employeeId: number): Promise<void> {
    return http.delete(`v1/1.0.0/employee/${employeeId}`).json<void>()
}

export function deleteEmployeesByPersonIdService(personId: number): Promise<void> {
    return http.delete(`v1/1.0.0/employee/by-person-id/${personId}`).json<void>()
}