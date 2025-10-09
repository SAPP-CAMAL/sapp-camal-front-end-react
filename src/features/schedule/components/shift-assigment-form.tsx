"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Role } from "@/features/roles/domain/roles.domain";
import { ShiftAssignment } from "./editShiftModal";
import { Button } from "@/components/ui/button";

const ShiftAssignmentForm = ({
  role = [],
  setRoleSelected,
  setShiftConfig,
  days,
  lines,
  onSave,
}: {
  role: Role[];
  setRoleSelected: any;
  setShiftConfig: any;
  days: any[];
  lines: any[];
  onSave: (data: ShiftAssignment) => void;
}) => {
  const form = useForm();

  const [formData, setFormData] = useState<ShiftAssignment>({
    employee: {
      id: "",
      name: "",
      documentNumber: "",
      role: "",
    },
    line: "",
    shift: "",
    startTime: "06:00",
    endTime: "14:00",
    startDate: "",
    endDate: "",
    workDays: [],
  });

  const isFormValid =
    formData.employee?.role &&
    formData.line &&
    formData.shift &&
    formData.startTime &&
    formData.endTime &&
    formData.startDate &&
    formData.endDate &&
    formData.workDays?.length > 0;

  const handleInputChange = (name: keyof ShiftAssignment, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDayToggle = (id: number) => {
    setFormData((prev) => {
      const currentDays = prev.workDays ?? [];
      const idStr = id.toString();

      return {
        ...prev,
        workDays: currentDays.includes(idStr)
          ? currentDays.filter((d) => d !== idStr)
          : [...currentDays, idStr],
      };
    });
  };

  const handleSubmit = (e: any) => {
    onSave(formData);
    e.preventDefault();
  };

  useEffect(() => {
    setShiftConfig(formData);
  }, [formData, setShiftConfig]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="flex gap-2 items-center text-lg font-semibold text-gray-800">
          <Settings className="w-5 h-5" />
          Configuración de Turno
        </h2>
        <p className="text-gray-600 text-sm mt-1">
          Configure los parámetros del turno que se aplicará a los empleados
          seleccionados.
        </p>
      </div>

      {/* Formulario */}
      <Form {...form}>
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Selección de Rol, Línea y Turno */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Rol */}
            <div className="flex flex-col">
              <label className="mb-2 text-sm font-medium text-gray-700">
                Rol *
              </label>
              <Select
                onValueChange={(value: string) => {
                  const selected = role.find((r) => String(r.id) === value);
                  setRoleSelected(selected ?? null);
                  handleInputChange("employee", {
                    ...formData.employee,
                    role: selected?.name ?? "",
                  });
                }}
              >
                <SelectTrigger className="h-10 w-full border border-gray-300 rounded-md">
                  <SelectValue placeholder="Seleccione un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="*">Seleccione un Rol</SelectItem>
                  {role.map((rol) => (
                    <SelectItem key={rol.id} value={String(rol.id)}>
                      {rol.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col">
              <label className="mb-2 text-sm font-medium text-gray-700">
                Líneas de Trabajo
              </label>
              <Select
                onValueChange={(value: string) => {
                  const selectedLine = lines.find(
                    (l) => String(l.id) === value
                  );
                  handleInputChange("line", selectedLine?.id ?? "");
                }}
              >
                <SelectTrigger className="h-10 w-full border border-gray-300 rounded-md">
                  <SelectValue placeholder="Seleccione una línea" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="*">Seleccione una línea</SelectItem>
                  {lines.map((line) => (
                    <SelectItem key={line.id} value={String(line.id)}>
                      {`${line.name} - ${line.specie?.name ?? ""}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Turno */}
            <div className="flex flex-col">
              <label className="mb-2 text-sm font-medium text-gray-700">
                Turno *
              </label>
              <Select
                onValueChange={(value: string) => {
                  if (value === "morning") {
                    setFormData((prev) => ({
                      ...prev,
                      shift: value,
                      startTime: "06:00",
                      endTime: "14:00",
                    }));
                  } else if (value === "afternoon") {
                    setFormData((prev) => ({
                      ...prev,
                      shift: value,
                      startTime: "14:00",
                      endTime: "22:00",
                    }));
                  } else if (value === "night") {
                    setFormData((prev) => ({
                      ...prev,
                      shift: value,
                      startTime: "22:00",
                      endTime: "06:00",
                    }));
                  } else {
                    handleInputChange("shift", value);
                  }
                }}
              >
                <SelectTrigger className="h-10 w-full border border-gray-300 rounded-md">
                  <SelectValue placeholder="Seleccione un turno" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">
                    Mañana (06:00 - 14:00)
                  </SelectItem>
                  <SelectItem value="afternoon">
                    Tarde (14:00 - 22:00)
                  </SelectItem>
                  <SelectItem value="night">Noche (22:00 - 06:00)</SelectItem>
                  <SelectItem value="personalizado">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Horarios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className="mb-2 text-sm font-medium text-gray-700">
                Hora de Ingreso *
              </label>
              <Input
                type="time"
                value={formData.startTime}
                onChange={(e) => handleInputChange("startTime", e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-2 text-sm font-medium text-gray-700">
                Hora de Salida *
              </label>
              <Input
                type="time"
                value={formData.endTime}
                onChange={(e) => handleInputChange("endTime", e.target.value)}
              />
            </div>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className="mb-2 text-sm font-medium text-gray-700">
                Fecha de Inicio *
              </label>
              <DatePicker
                value={formData.startDate || undefined}
                onChange={(date) =>
                  handleInputChange(
                    "startDate",
                    typeof date === "string"
                      ? date
                      : date?.toISOString().split("T")[0] ?? ""
                  )
                }
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-2 text-sm font-medium text-gray-700">
                Fecha Final *
              </label>
              <DatePicker
                value={formData.endDate || undefined}
                onChange={(date) =>
                  handleInputChange(
                    "endDate",
                    typeof date === "string"
                      ? date
                      : date?.toISOString().split("T")[0] ?? ""
                  )
                }
              />
            </div>
          </div>

          {/* Días de la semana */}
          <div>
            <label className="block mb-3 text-sm font-medium text-gray-700">
              Días de la Semana *
            </label>
            <div className="flex flex-wrap gap-3">
              {days?.map((day) => {
                const dayIdStr = day.id.toString();
                const isChecked =
                  formData.workDays?.includes(dayIdStr) ?? false;
                return (
                  <label
                    key={day.id}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() => handleDayToggle(day.id)}
                    />
                    <span className="text-sm text-gray-700">{day.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-md hover:bg-gray-800"
              disabled={!isFormValid}
            >
              <Settings className="w-4 h-4" />
              Configurar Turno
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ShiftAssignmentForm;
