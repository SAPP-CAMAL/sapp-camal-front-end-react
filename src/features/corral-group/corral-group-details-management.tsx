"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { HouseIcon, TriangleAlertIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MultiSelect } from "@/components/ui/multi-select";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import {
  getCorralGroupDetailsAdminService,
  getCorralsAllService,
  getCorralGroupsAdminService,
  createCorralGroupDetailsBulkService,
  deleteCorralGroupDetailsBulkService,
} from "./server/db/corral-group-admin.service";

/**
 * Gestión embebida de los corrales asignados a un grupo (corral_group_details).
 * Un corral no tiene línea/especie propia en el modelo de datos: se infiere de los
 * grupos a los que ha estado asignado (activo o no). Se excluyen del selector los
 * corrales ya asignados activamente a otro grupo, y los que históricamente
 * pertenecen a una línea/especie distinta a la de este grupo.
 */
export function CorralGroupDetailsManagement({
  fixedGroupId,
  lineId,
}: {
  fixedGroupId: number;
  lineId: number;
}) {
  const queryClient = useQueryClient();
  const [selectedCorralIds, setSelectedCorralIds] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedForRemoval, setSelectedForRemoval] = useState<Set<number>>(new Set());
  const [isRemoving, setIsRemoving] = useState(false);

  const detailsQuery = useQuery({
    queryKey: ["corral-group-details-admin"],
    queryFn: getCorralGroupDetailsAdminService,
  });

  const corralsQuery = useQuery({
    queryKey: ["corrals", "all-for-select"],
    queryFn: getCorralsAllService,
  });

  const groupsQuery = useQuery({
    queryKey: ["corral-groups-admin", "all-for-select"],
    queryFn: getCorralGroupsAdminService,
  });

  const allDetails = detailsQuery.data?.data ?? [];
  const groupDetails = allDetails.filter((d) => d.groupId === fixedGroupId && d.status);
  const assignedCorralIds = new Set(groupDetails.map((d) => d.corralId));

  const groupIdToLineId = new Map((groupsQuery.data?.data ?? []).map((g) => [g.id, g.idLine]));

  const corralIdsInOtherActiveGroups = new Set(
    allDetails.filter((d) => d.status && d.groupId !== fixedGroupId).map((d) => d.corralId)
  );

  const corralLineHistory = new Map<number, Set<number>>();
  allDetails.forEach((d) => {
    const line = groupIdToLineId.get(d.groupId);
    if (line === undefined) return;
    if (!corralLineHistory.has(d.corralId)) corralLineHistory.set(d.corralId, new Set());
    corralLineHistory.get(d.corralId)!.add(line);
  });

  const availableCorrals = (corralsQuery.data?.data ?? []).filter((c) => {
    if (!c.status) return false;
    if (assignedCorralIds.has(c.id)) return false;
    if (corralIdsInOtherActiveGroups.has(c.id)) return false;
    const history = corralLineHistory.get(c.id);
    if (history && !history.has(lineId)) return false;
    return true;
  });

  const handleAdd = async () => {
    if (!selectedCorralIds.length) return;
    setIsAdding(true);
    try {
      await createCorralGroupDetailsBulkService({
        groupId: fixedGroupId,
        corralIds: selectedCorralIds.map(Number),
      });
      setSelectedCorralIds([]);
      await queryClient.invalidateQueries({ queryKey: ["corral-group-details-admin"] });
      toast.success(
        selectedCorralIds.length === 1
          ? "Corral agregado al grupo"
          : `${selectedCorralIds.length} corrales agregados al grupo`
      );
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    } finally {
      setIsAdding(false);
    }
  };

  const toggleSelectedForRemoval = (detailId: number, checked: boolean) => {
    setSelectedForRemoval((prev) => {
      const next = new Set(prev);
      if (checked) next.add(detailId);
      else next.delete(detailId);
      return next;
    });
  };

  const toggleSelectAllForRemoval = (checked: boolean) => {
    setSelectedForRemoval(checked ? new Set(groupDetails.map((d) => d.id)) : new Set());
  };

  const handleRemoveSelected = async () => {
    if (!selectedForRemoval.size) return;
    setIsRemoving(true);
    try {
      const ids = Array.from(selectedForRemoval);
      await deleteCorralGroupDetailsBulkService(ids);
      setSelectedForRemoval(new Set());
      await queryClient.invalidateQueries({ queryKey: ["corral-group-details-admin"] });
      toast.success(
        ids.length === 1 ? "Corral removido del grupo" : `${ids.length} corrales removidos del grupo`
      );
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    } finally {
      setIsRemoving(false);
    }
  };

  const isLoadingOptions = corralsQuery.isLoading || detailsQuery.isLoading || groupsQuery.isLoading;
  const noAvailableCorrals = !isLoadingOptions && availableCorrals.length === 0;
  const allSelectedForRemoval = groupDetails.length > 0 && selectedForRemoval.size === groupDetails.length;

  return (
    <div>
      <div className="flex items-start gap-2 mb-1">
        <MultiSelect
          options={availableCorrals.map((corral) => ({ value: String(corral.id), label: corral.name }))}
          defaultValue={selectedCorralIds}
          onValueChange={setSelectedCorralIds}
          placeholder={
            noAvailableCorrals ? "No hay corrales disponibles" : "Seleccione corrales para agregar"
          }
          disabled={noAvailableCorrals}
          searchPlaceholder="Buscar corrales..."
          className="flex-1 min-w-0"
          modalPopover
        />
        <ConfirmationDialog
          title={
            selectedCorralIds.length === 1
              ? "¿Agregar este corral al grupo?"
              : `¿Agregar ${selectedCorralIds.length} corrales al grupo?`
          }
          onConfirm={handleAdd}
          triggerBtn={
            <Button className="shrink-0" disabled={!selectedCorralIds.length || isAdding}>
              Agregar {selectedCorralIds.length > 1 ? `(${selectedCorralIds.length})` : ""}
            </Button>
          }
          cancelBtn={<Button variant="outline">Cancelar</Button>}
          confirmBtn={<Button>Agregar</Button>}
        />
      </div>
      {noAvailableCorrals && (
        <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 text-amber-800 px-3 py-2 mb-3 text-sm">
          <TriangleAlertIcon className="h-4 w-4 mt-0.5 shrink-0" />
          <span>
            No hay corrales disponibles para asignar: todos los corrales activos ya están
            asignados a este u otro grupo, o pertenecen a la línea/especie de otro grupo.
          </span>
        </div>
      )}

      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="py-3 px-4 border-b flex items-center justify-between gap-2 flex-wrap">
          <span className="font-semibold text-sm">Corrales asignados ({groupDetails.length})</span>
          {groupDetails.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                <Checkbox
                  checked={allSelectedForRemoval}
                  onCheckedChange={(checked) => toggleSelectAllForRemoval(checked === true)}
                />
                Seleccionar todos
              </label>
              <ConfirmationDialog
                title={`¿Quitar ${selectedForRemoval.size} corral(es) del grupo?`}
                description="Esta acción se puede revertir volviendo a asignar el/los corral(es) al grupo."
                onConfirm={handleRemoveSelected}
                triggerBtn={
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={!selectedForRemoval.size || isRemoving}
                  >
                    <Trash2Icon className="h-4 w-4" />
                    Quitar seleccionados ({selectedForRemoval.size})
                  </Button>
                }
                cancelBtn={<Button variant="outline">Cancelar</Button>}
                confirmBtn={<Button variant="destructive">Quitar</Button>}
              />
            </div>
          )}
        </div>
        {detailsQuery.isLoading ? (
          <div className="p-8 text-center text-gray-500 animate-pulse">Cargando...</div>
        ) : groupDetails.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <HouseIcon className="h-8 w-8 mx-auto mb-2 opacity-20" />
            <p>Este grupo aún no tiene corrales asignados</p>
          </div>
        ) : (
          <ul className="divide-y">
            {groupDetails.map((detail) => (
              <li key={detail.id} className="flex items-center gap-2 px-4 py-2">
                <Checkbox
                  checked={selectedForRemoval.has(detail.id)}
                  onCheckedChange={(checked) => toggleSelectedForRemoval(detail.id, checked === true)}
                />
                <span className="text-sm">{detail.corral?.name ?? `Corral #${detail.corralId}`}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
