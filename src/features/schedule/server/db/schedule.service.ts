import { http } from "@/lib/ky";
import { FilterSchedule, ResponseCreateSchedule, ResponseScheduleByFilter, Schedule } from "../../domain";

export function createScheduleService(body: Omit<Schedule, "id" | "status">): Promise<ResponseCreateSchedule> {
    return http.post("v1/1.0.0/schedule", {
        json: body
    }).json<ResponseCreateSchedule>()
}

export function deleteScheduleService(id: number) {
    return http.delete(`v1/1.0.0/schedule/${id}`).json()
}

export function getScheduleByFiltersService(filters: FilterSchedule = {}): Promise<ResponseScheduleByFilter> {
    return http.post("v1/1.0.0/schedule/schedule-by-filter",{
next: {
            tags: ["schedule"],
        },
        json: filters
    }).json<ResponseScheduleByFilter>()
}

export function updateScheduleService(id:number, body: Omit<Schedule, "id" | "status">): Promise<ResponseCreateSchedule> {
    return http.patch(`v1/1.0.0/schedule/${id}`, {
        json: body
    }).json<ResponseCreateSchedule>()
}