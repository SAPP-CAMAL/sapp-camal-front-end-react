import {
  CommonHttpResponse,
  CommonHttpResponsePagination,
} from "@/features/people/domain";
import { Specie } from "@/features/specie/domain";

export type ResponseCreateSchedule = {
  code: number;
  message: string;
  data: Schedule;
};

export interface Schedule {
  idEmployee: number;
  idDay: number;
  checkInTime: string;
  checkOutTime: string;
  startDate: string;
  endDate: string;
  idLines: number;
  status: boolean;
  commentary: string;
  userCreated?: number;
  userOrigin?: string;
  updatedAt?: null;
  userUpdated?: null;
  createdAt?: Date;
  nroVersion?: number;
  id?: number;
}

export interface Line {
  id: number;
  name: string;
  description: string;
  status: boolean;
  idSpecie: number;
  specie: Specie;
}

export interface Days {
  id: number;
  name: string;
  abbrev: string;
  status: boolean;
}

export type FilterSchedule = {
  page?: number;
  limit?: number;
  idEmployee?: number;
  idLine?: number;
  idDay?: number;
};

export type ResponseLineSearchAllService = CommonHttpResponse<Line>;
export type ResponseDaysSearchAllService = CommonHttpResponse<Days>;
export type ResponseScheduleByFilter = CommonHttpResponsePagination<Schedule>;
