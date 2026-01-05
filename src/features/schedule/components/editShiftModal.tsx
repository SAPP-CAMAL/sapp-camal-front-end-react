import { useEffect, useState } from "react";
import { X, User, CheckCircle2, EditIcon, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  createScheduleService,
  updateScheduleService,
} from "../server/db/schedule.service";
import { toast } from "sonner";

interface Employee {
  id: string;
  name: string;
  documentNumber: string;
  role: string;
}

export interface ShiftAssignment {
  id?: string;
  employee: Employee;
  line?: string;
  shift?: string;
  startTime?: string;
  endTime?: string;
  startDate?: string;
  endDate?: string;
  workDays: string[];
  status?: boolean;
  commentary?: string;
}

interface EditShiftModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment?: ShiftAssignment | null;
  isUpdated: boolean;
  days: any[];
  lines: any[];
}

const AVAILABLE_SHIFTS = [
  { value: "turno", label: "Mañana (06:00 - 14:00)" },
  { value: "afternoon", label: "Tarde (14:00 - 22:00)" },
  { value: "night", label: "Noche (22:00 - 06:00)" },
];

export default function EditShiftModal({
  open,
  onOpenChange,
  assignment,
  isUpdated,
  lines,
  days,
}: EditShiftModalProps) {
  const [formData, setFormData] = useState<ShiftAssignment>({
    employee: assignment?.employee || {
      id: "",
      name: "",
      documentNumber: "",
      role: "",
    },
    line: assignment?.line || "",
    shift: assignment?.shift || "",
    startTime: assignment?.startTime || "06:00",
    endTime: assignment?.endTime || "14:00",
    startDate: assignment?.startDate || "",
    endDate: assignment?.endDate || "",
    workDays: assignment?.workDays || [],
    status: assignment?.status ?? true,
    commentary: "",
    id: assignment?.id,
  });
  const [validationMessage, setValidationMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const [hasChanges, setHasChanges] = useState(false);

  const handleWorkDayToggle = (dayId: string) => {
    const currentDays = formData.workDays || [];
    const newDays = currentDays.includes(dayId.toString())
      ? currentDays.filter((d) => d !== dayId.toString())
      : [...currentDays, dayId.toString()];

    setFormData({ ...formData, workDays: newDays });
    setHasChanges(true);
  };

  const handleShiftChange = (shift: string) => {
    const shiftConfig = {
      morning: { startTime: "06:00", endTime: "14:00", label: "Turno Mañana" },
      afternoon: { startTime: "14:00", endTime: "22:00", label: "Turno Tarde" },
      night: { startTime: "22:00", endTime: "06:00", label: "Turno Noche" },
    };

    const config = shiftConfig[shift as keyof typeof shiftConfig];

    setFormData({
      ...formData,
      shift,
      commentary: config?.label ? config.label : "",
      startTime: config.startTime,
      endTime: config.endTime,
    });

    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        idEmployee: Number(formData.employee?.id ?? 0),
        idDay: Number(formData.workDays?.[0] ?? 0),
        idLines: Number(formData.line ?? 0),
        commentary: formData.commentary?.trim() ?? "",
        checkInTime: formData.startTime ?? "",
        checkOutTime: formData.endTime ?? "",
        startDate: formData.startDate ?? "",
        endDate: formData.endDate ?? "",
      };

      if (!payload.idEmployee || !payload.idDay || !payload.idLines) {
        toast.error("Faltan datos obligatorios (empleado, día o línea).");
        return;
      }

      if (isUpdated) {
        await updateScheduleService(Number(formData.id), payload);
        toast.success("Registro actualizado exitosamente");
      } else {
        await createScheduleService(payload);
        toast.success("Turno asignado exitosamente");
      }

      handleCancel();
      setHasChanges(false);
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error al guardar el turno.");
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setHasChanges(false);
  };

  const handleValidate = () => {
    if (!formData.startDate || !formData.endDate) {
      setValidationMessage({
        type: "error",
        text: "Por favor, complete ambas fechas.",
      });
      return;
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);

    if (end <= start) {
      setValidationMessage({
        type: "error",
        text: "La fecha de fin debe ser posterior a la fecha de inicio.",
      });
      return;
    }

    // Si pasa la validación
    setValidationMessage({
      type: "success",
      text: "Los cambios son válidos y no presentan conflictos.",
    });
    setHasChanges(true);
  };

  useEffect(() => {
    if (assignment) {
      setFormData({
        employee: assignment.employee,
        line: assignment.line || "",
        shift: assignment.shift || "",
        startTime: assignment.startTime || "06:00",
        endTime: assignment.endTime || "14:00",
        startDate: assignment.startDate || "",
        endDate: assignment.endDate || "",
        workDays: assignment.workDays || [],
        status: assignment.status ?? true,
        id: assignment.id,
      });
    }
  }, [assignment]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] md:max-w-2xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <span className="p-2 bg-gray-100 rounded-lg">
              {isUpdated ? (
                <EditIcon className="w-5 h-5" />
              ) : (
                <User className="w-5 h-5" />
              )}
            </span>
            {isUpdated ? "Editar Asignación de Turno" : "Asignar Turno"}
          </DialogTitle>
          <DialogDescription>
            {isUpdated
              ? "Modificar los detalles de la asignación existente"
              : "Crea una nueva asignación de turno para el empleado"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <Label className="flex items-center gap-2 text-sm font-medium mb-2">
              <User className="w-4 h-4" />
              Empleado
            </Label>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-base">
                  {formData?.employee?.name}
                </p>
                <p className="text-sm text-gray-600">
                  Doc: {formData?.employee?.documentNumber}
                </p>
              </div>
              <Badge>{formData?.employee?.role}</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="line">Líneas de Trabajo</Label>
              <Select
                value={String(formData.line)}
                onValueChange={(value) => {
                  setFormData({ ...formData, line: value });
                  setHasChanges(true);
                }}
              >
                <SelectTrigger id="line">
                  <SelectValue placeholder="Seleccionar líneas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="*">Seleccione una línea</SelectItem>
                  {lines.map((line) => (
                    <SelectItem key={line.id} value={String(line.id)}>
                      {line.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Fecha Inicio</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => {
                  setFormData({ ...formData, startDate: e.target.value });
                  setHasChanges(true);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Fecha Fin</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => {
                  setFormData({ ...formData, endDate: e.target.value });
                  setHasChanges(true);
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shift">Turno</Label>
            <Select value={formData.shift} onValueChange={handleShiftChange}>
              <SelectTrigger id="shift">
                <SelectValue placeholder="Seleccionar turno" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_SHIFTS.map((shift) => (
                  <SelectItem key={shift.value} value={shift.value}>
                    {shift.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Días de Trabajo</Label>
            <div className="flex gap-2 w-full justify-between">
              {days.map((day) => (
                <div
                  key={day.id}
                  className="flex flex-col items-center gap-1 flex-1"
                >
                  <Checkbox
                    id={String(day.id)}
                    checked={formData.workDays?.includes(String(day.id))}
                    onCheckedChange={() => handleWorkDayToggle(day.id)}
                    className="w-5 h-5"
                  />
                  <Label
                    htmlFor={String(day.id)}
                    className="text-xs font-normal cursor-pointer"
                  >
                    {day.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Hora Inicio</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => {
                  setFormData({ ...formData, startTime: e.target.value });
                  setHasChanges(true);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">Hora Fin</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => {
                  setFormData({ ...formData, endTime: e.target.value });
                  setHasChanges(true);
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <Select
              value={formData.status ? "active" : "inactive"}
              onValueChange={(value) => {
                setFormData({ ...formData, status: value === "active" });
                setHasChanges(true);
              }}
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                    Activo
                  </span>
                </SelectItem>
                <SelectItem value="inactive">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-gray-400 rounded-full" />
                    Inactivo
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {validationMessage && (
            <Alert
              className={
                validationMessage.type === "success"
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }
            >
              {validationMessage.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription
                className={
                  validationMessage.type === "success"
                    ? "text-green-800"
                    : "text-red-800"
                }
              >
                {validationMessage.text}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button variant="outline" onClick={handleValidate}>
            Validar Cambios
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges}>
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
