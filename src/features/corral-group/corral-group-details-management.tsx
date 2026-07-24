"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { HouseIcon, TriangleAlertIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getCorralGroupDetailsAdminService,
  getCorralsAllService,
  getCorralGroupsAdminService,
  createCorralGroupDetailService,
  deleteCorralGroupDetailService,
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
  const [selectedCorralId, setSelectedCorralId] = useState<string>("");
  const [pendingId, setPendingId] = useState<number | null>(null);

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
    if (!selectedCorralId) return;
    try {
      await createCorralGroupDetailService({
        corralId: Number(selectedCorralId),
        groupId: fixedGroupId,
      });
      setSelectedCorralId("");
      await queryClient.invalidateQueries({ queryKey: ["corral-group-details-admin"] });
      toast.success("Corral agregado al grupo");
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  };

  const handleRemove = async (detailId: number) => {
    setPendingId(detailId);
    try {
      await deleteCorralGroupDetailService(detailId);
      await queryClient.invalidateQueries({ queryKey: ["corral-group-details-admin"] });
      toast.success("Corral removido del grupo");
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    } finally {
      setPendingId(null);
    }
  };

  const isLoadingOptions = corralsQuery.isLoading || detailsQuery.isLoading || groupsQuery.isLoading;
  const noAvailableCorrals = !isLoadingOptions && availableCorrals.length === 0;

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-2 mb-1">
        <Select
          value={selectedCorralId}
          onValueChange={setSelectedCorralId}
          disabled={noAvailableCorrals}
        >
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue
              placeholder={
                noAvailableCorrals
                  ? "No hay corrales disponibles"
                  : "Seleccione un corral para agregar"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {availableCorrals.map((corral) => (
              <SelectItem key={corral.id} value={String(corral.id)}>
                {corral.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleAdd} disabled={!selectedCorralId}>
          Agregar corral
        </Button>
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
        <div className="py-3 px-4 border-b">
          <span className="font-semibold text-sm">Corrales asignados ({groupDetails.length})</span>
        </div>
        {detailsQuery.isLoading ? (
          <div className="p-8 text-center text-gray-500 animate-pulse">Cargando...</div>
        ) : groupDetails.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <HouseIcon className="h-8 w-8 mx-auto mb-2 opacity-20" />
            <p>Este grupo aún no tiene corrales asignados</p>
          </div>
        ) : (
          <div className="p-4 flex flex-wrap gap-2">
            {groupDetails.map((detail) => (
              <Badge key={detail.id} variant="outline" className="gap-1 pr-1 text-sm">
                {detail.corral?.name ?? `Corral #${detail.corralId}`}
                <button
                  type="button"
                  className="ml-1 rounded-full hover:bg-gray-200 p-0.5 disabled:opacity-50"
                  disabled={pendingId === detail.id}
                  onClick={() => handleRemove(detail.id)}
                >
                  <XIcon className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
