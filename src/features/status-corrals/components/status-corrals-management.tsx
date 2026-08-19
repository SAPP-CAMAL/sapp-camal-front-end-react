"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { getActiveLinesService } from "@/features/postmortem/server/db/line.service";
import { ConfirmToggleDialog } from "@/features/corrals/components/parts/ConfirmToggleDialog";
import { useStatusCorralsDailyAdmin } from "../hooks/use-status-corrals-daily-admin";
import { useToggleStatusCorral } from "../hooks/use-toggle-status-corral";
import { StatusCorralDailyAdmin } from "../domain/status-corral.domain";

export function StatusCorralsManagement() {
  const { data: lines, isLoading: isLoadingLines } = useQuery({
    queryKey: ["status-corrals-lines"],
    queryFn: getActiveLinesService,
    staleTime: 1000 * 60 * 5,
  });

  const [selectedIdLine, setSelectedIdLine] = useState<number | null>(null);
  const [selectedFinishTypeId, setSelectedFinishTypeId] = useState<string>("all");

  useEffect(() => {
    if (!selectedIdLine && lines && lines.length > 0) {
      setSelectedIdLine(lines[0].id);
    }
  }, [lines, selectedIdLine]);

  const { data: statusCorrals, isLoading: isLoadingStatus } = useStatusCorralsDailyAdmin(selectedIdLine);

  const { mutate: toggleStatus, isPending: isToggling } = useToggleStatusCorral();

  const [dialogTarget, setDialogTarget] = useState<StatusCorralDailyAdmin | null>(null);

  const finishTypes = useMemo(() => {
    if (!statusCorrals) return [];
    const map = new Map<number, string>();
    statusCorrals.forEach((item) => {
      const finishType = item.corralGroup?.finishType;
      if (finishType) {
        map.set(finishType.id, finishType.name);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [statusCorrals]);

  const hasFinishTypes = finishTypes.length > 0;

  useEffect(() => {
    setSelectedFinishTypeId("all");
  }, [selectedIdLine]);

  const filteredData = useMemo(() => {
    if (!statusCorrals) return [];
    if (selectedFinishTypeId === "all") return statusCorrals;
    const finishTypeId = Number(selectedFinishTypeId);
    return statusCorrals.filter((item) => item.corralGroup?.finishType?.id === finishTypeId);
  }, [statusCorrals, selectedFinishTypeId]);

  const handleToggle = (item: StatusCorralDailyAdmin) => {
    toggleStatus(
      { statusRecordId: item.id, close: !item.closeCorral },
      {
        onSuccess: () => setDialogTarget(null),
      }
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Administración Diaria de Corrales</h1>
        <p className="text-sm text-muted-foreground">
          Abrir o cerrar corrales con registro para el día de hoy.
        </p>
      </div>

      {isLoadingLines ? (
        <div className="text-sm text-muted-foreground">Cargando líneas...</div>
      ) : lines && lines.length > 0 ? (
        <Tabs
          value={selectedIdLine ? String(selectedIdLine) : undefined}
          onValueChange={(value) => setSelectedIdLine(Number(value))}
        >
          <TabsList className="h-auto flex-wrap">
            {lines.map((line) => (
              <TabsTrigger key={line.id} value={String(line.id)}>
                {line.name}
                {line.specie?.name ? ` (${line.specie.name})` : ""}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      ) : (
        <div className="text-sm text-muted-foreground">No hay líneas disponibles</div>
      )}

      {hasFinishTypes && (
        <div className="w-full sm:w-64">
          <Select value={selectedFinishTypeId} onValueChange={setSelectedFinishTypeId}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo de acabado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos de acabado</SelectItem>
              {finishTypes.map((finishType) => (
                <SelectItem key={finishType.id} value={String(finishType.id)}>
                  {finishType.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="hidden lg:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Corral</TableHead>
                {hasFinishTypes && <TableHead>Tipo de Acabado</TableHead>}
                <TableHead>Cantidad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingStatus ? (
                <TableRow>
                  <TableCell
                    colSpan={hasFinishTypes ? 5 : 4}
                    className="h-48 text-center animate-pulse"
                  >
                    Cargando datos...
                  </TableCell>
                </TableRow>
              ) : filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableRow key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell>{item.corral.name}</TableCell>
                    {hasFinishTypes && (
                      <TableCell>{item.corralGroup?.finishType?.name ?? "-"}</TableCell>
                    )}
                    <TableCell>{item.quantity ?? 0}</TableCell>
                    <TableCell>
                      {item.closeCorral ? (
                        <Badge variant="destructive">Cerrado</Badge>
                      ) : (
                        <Badge variant="tertiary">Abierto</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant={item.closeCorral ? "outline" : "destructive"}
                        onClick={() => setDialogTarget(item)}
                        disabled={isToggling}
                      >
                        {item.closeCorral ? "Abrir" : "Cerrar"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={hasFinishTypes ? 5 : 4} className="h-48 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                      <Search className="h-8 w-8 opacity-20" />
                      <p>No hay corrales con registro para hoy</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="lg:hidden p-4">
          {isLoadingStatus ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse h-32" />
              ))}
            </div>
          ) : filteredData.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredData.map((item) => (
                <Card key={item.id} className="overflow-hidden border-gray-200">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Corral
                      </span>
                      <span className="text-sm">{item.corral.name}</span>
                    </div>
                    {hasFinishTypes && (
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          Tipo de Acabado
                        </span>
                        <span className="text-sm">{item.corralGroup?.finishType?.name ?? "-"}</span>
                      </div>
                    )}
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Cantidad
                      </span>
                      <span className="text-sm">{item.quantity ?? 0}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Estado
                      </span>
                      {item.closeCorral ? (
                        <Badge variant="destructive" className="w-fit">Cerrado</Badge>
                      ) : (
                        <Badge variant="tertiary" className="w-fit">Abierto</Badge>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant={item.closeCorral ? "outline" : "destructive"}
                      className="w-full"
                      onClick={() => setDialogTarget(item)}
                        disabled={isToggling}
                    >
                      {item.closeCorral ? "Abrir" : "Cerrar"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-20" />
              <p>No hay corrales con registro para hoy</p>
            </div>
          )}
        </div>
      </div>

      <ConfirmToggleDialog
        open={!!dialogTarget}
        onOpenChange={(open) => !open && setDialogTarget(null)}
        action={dialogTarget?.closeCorral ? "abrir" : "cerrar"}
        name={dialogTarget?.corral.name ?? ""}
        onConfirm={() => dialogTarget && handleToggle(dialogTarget)}
      />
    </div>
  );
}
