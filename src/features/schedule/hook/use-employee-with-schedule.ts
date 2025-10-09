import { getEmployeesByRoleIdService } from "@/features/employees/server/db/employees.services";
import { useQuery } from "@tanstack/react-query";
import { getScheduleByFiltersService } from "../server/db/schedule.service";
import { getLineService } from "../server/db/line.service";
import dayjs from "dayjs";
import { Line } from "../domain";

export const useEmployeesWithSchedules = (roleId?: number) => {
  
  return useQuery({
    queryKey: ["employees-with-schedules", roleId],
    queryFn: async () => {
      if (!roleId) return [];

      const employees = await getEmployeesByRoleIdService(roleId);

      const employeesWithSchedules = await Promise.all(
         employees?.data?.map(async (emp: any) => {
          try {
            const schedules = await getScheduleByFiltersService({limit:20, page:1, idEmployee:emp.id});
            
            const linesResponse = await getLineService();
            const groupedSchedules = groupSchedules(schedules?.data?.items, linesResponse?.data);
            
            return {
              ...emp,
              schedules: groupedSchedules.length > 0 ? groupedSchedules : null,
            };
          } catch (err: any) {
            if (
              err.response?.status === 400 
            ) {
              return { ...emp, schedules: null };
            }
            throw err;
          }
        })
      );

      return employeesWithSchedules;
    },
    enabled: !!roleId, 
  });
};

export const groupSchedules = (schedules: any[], lines:Line[]) => {
  const grouped: any[] = [];
  schedules.forEach((s) => {
    const existing = grouped.find(
      (g) =>
        g.checkInTime === s.checkInTime &&
        g.checkOutTime === s.checkOutTime &&
        g.startDate === s.startDate &&
        g.endDate === s.endDate
    );
    const line = lines.find((l) => l.id === s.idLines);
    const lineName = line ? line.name.concat(' ').concat(line.description) : "Sin línea";

    if (existing) {
      existing.days.push(s.idDay);
    } else {
      grouped.push({
        id:s.id,
        idEmployee: s.idEmployee,
        checkInTime: s.checkInTime,
        checkOutTime: s.checkOutTime,
        startDate: s.startDate,
        endDate: s.endDate,
        days: [s.idDay],
        commentary:s.commentary,
        idLines:s.idLines,
        lineName: lineName,
        status:
          dayjs().isAfter(dayjs(s.endDate)) ? "Vencido" : "Activo",
      });
    }
  });

  return grouped;
};