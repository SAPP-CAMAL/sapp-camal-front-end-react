"use client";

import { Card } from "@/components/ui/card";
import {
  Building,
  Check,
  Circle,
  Clock,
  EditIcon,
  Grid3x3,
  Trash,
  UserCheck,
  UserPlus,
  Users,
  UserX,
} from "lucide-react";
import ShiftAssignmentForm from "./shift-assigment-form";
import { useQuery } from "@tanstack/react-query";
import { getUserRolesService } from "@/features/security/server/db/security.queries";
import { EmployeeTable } from "./table-employee";
import { parseAsInteger, useQueryStates } from "nuqs";
import { Badge } from "@/components/ui/badge";
import EditShiftModal, { ShiftAssignment } from "./editShiftModal";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Role } from "@/features/roles/domain/roles.domain";
import { Checkbox } from "@/components/ui/checkbox";
import { useEmployeesWithSchedules } from "../hook/use-employee-with-schedule";
import {
  createScheduleService,
  deleteScheduleService,
} from "../server/db/schedule.service";
import { toast } from "sonner";
import { Days } from "../domain";
import { getDaysService, getLineService } from "../server/db/line.service";

export function ScheduleManagement({}) {
  const [searchParams, setSearchParams] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(10),
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);
  const [days, setDays] = useState<Days[]>([]);
  const [assigmentsLines, setAssigmentsLines] = useState<any[]>();
  const [selectedAssignment, setSelectedAssignment] = useState<any | null>(
    null
  );
  const [shiftConfig, setShiftConfig] = useState({
    employee: {
      id: "",
      name: "",
      documentNumber: "",
      role: "",
    },
    line: null,
    shift: null,
    startTime: "",
    endTime: "",
    startDate: null,
    endDate: null,
    workDays: [],
  });
  const [selectedRole, setSelectedRole] = useState<Role>();
  const { data, isLoading } = useEmployeesWithSchedules(selectedRole?.id ?? 0);
  const unassignedCount =
    data?.filter((item) => item.schedules === null)?.length ?? 0;
  const assignedCount =
    data?.filter((item) => item.schedules != null)?.length ?? 0;

  const handleSave = async (updatedAssignment: any) => {
    try {
      const unassignedEmployees =
        data?.filter((item) => item.schedules === null) ?? [];

      if (unassignedEmployees.length === 0) {
        toast.info("No hay empleados sin turno asignado.");
        return;
      }

      for (const employee of unassignedEmployees) {
        const payload = {
          idEmployee: Number(employee.id),
          idDay: Number(updatedAssignment.workDays?.[0] ?? 0),
          idLines: Number(updatedAssignment.line ?? 0),
          commentary: updatedAssignment.commentary?.trim() ?? "",
          checkInTime: updatedAssignment.startTime ?? "",
          checkOutTime: updatedAssignment.endTime ?? "",
          startDate: updatedAssignment.startDate ?? "",
          endDate: updatedAssignment.endDate ?? "",
        };

        await createScheduleService(payload);
      }

      toast.success("Turnos asignados exitosamente");
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error al asignar los turnos.");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteScheduleService(id);
      toast.success("Horario eliminado exitosamente");
    } catch (error) {
      toast.error("No pudo eliminar el horario");
    }
  };
  const query = useQuery({
    queryKey: ["roles"],
    queryFn: () => getUserRolesService(),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const daysResponse = await getDaysService();
        setDays(daysResponse.data ?? []);

        const linesResponse = await getLineService();
        setAssigmentsLines(
          linesResponse?.data?.map((line) => ({
            id: line?.id ?? "",
            name: `${line?.name ?? ""} ${line?.specie?.name ?? ""}`,
          })) ?? []
        );
      } catch (error) {
        console.error("Error fetching data:", error);
        setDays([]);
        setAssigmentsLines([]);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <section className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="flex items-center gap-2 text-xl font-semibold">
            <Clock className="w-5 h-5" />
            Asignación de Turnos - Centro de Faenamiento
          </h1>
          <p className="text-sm text-gray-600">
            Configuración y gestión de turnos por rol y línea de trabajo
          </p>
        </div>
      </section>

      <ShiftAssignmentForm
        role={query?.data?.data ?? []}
        setRoleSelected={setSelectedRole}
        setShiftConfig={setShiftConfig}
        lines={assigmentsLines ?? []}
        days={days ?? []}
        onSave={handleSave}
      />

      <Card className="overflow-hidden">
        <div className="p-1.5  bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold">
                Empleados - {selectedRole?.name || "Corralero"}
              </h2>
            </div>
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-600 border-blue-200"
            >
              {data?.length} empleados
            </Badge>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Lista de empleados con el rol seleccionado y sus asignaciones
            actuales
          </p>
        </div>
        <EmployeeTable
          columns={[
            {
              id: "select",
              header: ({ table }) => (
                <Checkbox
                  checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                  }
                  onCheckedChange={(value) =>
                    table.toggleAllPageRowsSelected(!!value)
                  }
                  aria-label="Select all"
                />
              ),
              cell: ({ row }) => (
                <Checkbox
                  checked={row.getIsSelected()}
                  onCheckedChange={(value) => row.toggleSelected(!!value)}
                  aria-label="Select row"
                />
              ),
              enableSorting: false,
              enableHiding: false,
            },
            {
              accessorKey: "schedules.lineName",
              header: "Línea",
              cell: ({ row }) => {
                const lineName = row.original?.schedules?.[0]?.lineName;

                return lineName ? (
                  <Badge className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <Building />
                    {lineName}
                  </Badge>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    Sin línea
                  </span>
                );
              },
            },
            {
              accessorKey: "fullName",
              header: "Empleado",
              cell: ({ row }) => (
                <div className="flex flex-col">
                  <div className="font-semibold">{row.original.fullName}</div>
                  <div className="text-gray-500">
                    Doc: {row.original.identification}
                  </div>
                </div>
              ),
            },
            {
              accessorKey: "schedules",
              header: "Turno / Horario",
              cell: ({ row }) => {
                const schedule = row.original.schedules;

                if (!schedule) {
                  return <div className="text-gray-400">Sin asignar</div>;
                }

                return (
                  <div className="flex flex-col">
                    <div className="font-semibold">
                      {row.original.schedules[0].commentary
                        ? row.original.schedules[0].commentary
                        : "-"}
                    </div>
                    <div className="text-gray-500">
                      {row.original.schedules[0].checkInTime} -{" "}
                      {row.original.schedules[0].checkOutTime}
                    </div>
                  </div>
                );
              },
            },
            {
              accessorKey: "days",
              header: "Días Asignados",
              cell: ({ row }) => {
                const schedule = row.original.schedules;

                if (!schedule) {
                  return <div className="text-gray-400">-</div>;
                }
                return row.original.schedules?.map((sch: any) => (
                  <div key={sch.startDate + sch.checkInTime}>
                    <div className="flex gap-2">
                      {["L", "M", "M", "J", "V", "S", "D"].map((d, idx) => (
                        <div key={idx} className="flex flex-col items-center">
                          {sch.days.includes(idx + 1) ? (
                            <Check className="text-green-400 w-5 h-5" />
                          ) : (
                            <Circle className="text-gray-500 w-5 h-5" />
                          )}
                          <span className="text-xs text-gray-600 mt-1">
                            {d}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ));
              },
            },
            {
              accessorKey: "period",
              header: "Período",
              cell: ({ row }) => {
                const schedule = row.original.schedules;

                if (!schedule) {
                  return <div className="text-gray-400">-</div>;
                }
                return (
                  <div className="flex flex-col">
                    <div className="font-semibold">
                      {row.original.schedules?.[0].startDate}
                    </div>
                    <div className="text-gray-500">
                      {row.original.schedules?.[0].endDate}
                    </div>
                  </div>
                );
              },
            },
            {
              accessorKey: "schedules.status",
              header: "Estado",
              cell: ({ row }) => {
                const schedule = row.original.schedules;

                if (!schedule) {
                  return <div className="text-gray-400">Sin asignar</div>;
                }
                return (
                  <Badge variant={"outline"}>
                    <span
                      style={{
                        color:
                          row.original.schedules[0].status === "Activo"
                            ? "green"
                            : "red",
                      }}
                    >
                      {row.original.schedules[0].status}
                    </span>
                  </Badge>
                );
              },
            },
            {
              id: "actions",
              header: "Acciones",
              cell: ({ row }) => {
                const empleado = row.original as any;

                const tieneAsignacion = empleado.schedules != null;

                return (
                  <div className="flex gap-2">
                    {tieneAsignacion ? (
                      <>
                        <Button
                          variant={"outline"}
                          onClick={() => {
                            setSelectedAssignment(
                              mapEmployeeToShiftAssignment(
                                empleado,
                                selectedRole?.description ?? ""
                              )
                            );
                            setIsModalOpen(true);
                            setIsUpdated(true);
                          }}
                        >
                          <EditIcon />
                        </Button>
                        <Button
                          variant={"outline"}
                          onClick={() =>
                            handleDelete(row.original?.schedules?.[0].id)
                          }
                        >
                          <Trash className="text-red-600" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        className="flex items-center gap-1 rounded-md bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
                        onClick={() => {
                          setSelectedAssignment({
                            ...shiftConfig,
                            employee: {
                              id: empleado.id,
                              name: empleado.fullName,
                              documentNumber: empleado.identification,
                              role: shiftConfig.employee.role,
                            },
                            empleadoId: empleado.id,
                          });
                          setIsModalOpen(true);
                          setIsUpdated(false);
                        }}
                      >
                        <UserPlus size={16} /> Asignar
                      </Button>
                    )}
                  </div>
                );
              },
            },
          ]}
          data={data ?? []}
          meta={{
            onChangePage: (page) => {
              setSearchParams({ page });
            },
            onNextPage: () => {
              setSearchParams({ page: searchParams.page + 1 });
            },
            disabledNextPage:
              searchParams.page >= /* query.data?.data.meta.totalPages ?? */ 0,
            onPreviousPage: () => {
              setSearchParams({ page: searchParams.page - 1 });
            },
            disabledPreviousPage: searchParams.page <= 1,
            setSearchParams,
          }}
          isLoading={isLoading}
        />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Empleados Disponibles</p>
              <p className="text-2xl font-bold">{data?.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <UserCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Asignados</p>
              <p className="text-2xl font-bold">{assignedCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-50 rounded-lg">
              <UserX className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Sin Asignar</p>
              <p className="text-2xl font-bold">{unassignedCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Grid3x3 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Líneas Activas</p>
              <p className="text-2xl font-bold">1</p>
            </div>
          </div>
        </Card>
        <EditShiftModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          assignment={selectedAssignment}
          isUpdated={isUpdated}
          lines={assigmentsLines ?? []}
          days={days}
        />
      </div>
    </div>
  );
}

function mapEmployeeToShiftAssignment(
  employeeData: any,
  role: string
): ShiftAssignment {
  const schedule = employeeData.schedules[0];
  const commentary = schedule.commentary?.toLowerCase() ?? "";

  let shift = "";
  if (commentary.includes("mañana")) {
    shift = "morning";
  } else if (commentary.includes("tarde")) {
    shift = "afternoon";
  } else if (commentary.includes("noche")) {
    shift = "night";
  } else {
    shift = "unknown";
  }

  return {
    id: String(schedule.id),
    employee: {
      id: String(employeeData.id),
      name: `${employeeData.firstName} ${employeeData.lastName}`,
      documentNumber: employeeData.identification,
      role: role,
    },
    line: schedule.idLines,
    startTime: schedule.checkInTime,
    endTime: schedule.checkOutTime,
    startDate: schedule.startDate,
    endDate: schedule.endDate,
    workDays: schedule.days.map(String),
    status: schedule.status === "Activo",
    shift: shift,
  };
}
