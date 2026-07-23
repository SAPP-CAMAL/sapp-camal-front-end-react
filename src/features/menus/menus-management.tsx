"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ListTreeIcon, LinkIcon, Activity, Settings } from "lucide-react";
import { TableMenus } from "./table-menus";
import { useQuery } from "@tanstack/react-query";
import { getMenusAdminService } from "./server/db/menus.service";
import { getModulesService } from "@/features/modules/server/db/modules.service";
import { NewMenu } from "./components/new-menu";
import { UpdateMenu } from "./components/update-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebouncedCallback } from "use-debounce";

export function MenusManagement({ fixedModuleId }: { fixedModuleId?: number } = {}) {
  const [page, setPage] = useState(1);
  const limit = 10;
  const [menuName, setMenuName] = useState("");
  const [moduleId, setModuleId] = useState<string>("*");
  const [status, setStatus] = useState<string>("*");

  const effectiveModuleId = fixedModuleId ?? (moduleId !== "*" ? Number(moduleId) : undefined);

  const modulesQuery = useQuery({
    queryKey: ["modules", "all-for-filter"],
    queryFn: () => getModulesService({ page: 1, limit: 100 }),
    enabled: !fixedModuleId,
  });

  const query = useQuery({
    queryKey: ["menus-admin", { page, limit, menuName, moduleId: effectiveModuleId, status }],
    queryFn: () =>
      getMenusAdminService({
        page,
        limit,
        ...(!!menuName && { menuName }),
        ...(effectiveModuleId !== undefined && { moduleId: effectiveModuleId }),
        ...(status !== "*" && { status }),
      }),
  });

  const debounceName = useDebouncedCallback((text: string) => {
    setMenuName(text);
    setPage(1);
  }, 500);

  return (
    <div>
      {!fixedModuleId && (
        <section className="mb-4 flex flex-col sm:flex-row sm:justify-between gap-2">
          <div>
            <h1 className="flex items-center gap-x-2 font-semibold text-xl">
              <ListTreeIcon />
              Gestión de Menús
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Administra el árbol de navegación del sistema por módulo.
            </p>
          </div>
          <div className="flex gap-x-2">
            <NewMenu />
          </div>
        </section>
      )}

      {fixedModuleId && (
        <div className="flex justify-end mb-4">
          <NewMenu fixedModuleId={fixedModuleId} />
        </div>
      )}

      <Card className="mb-4 py-3 gap-2">
        <CardHeader className="px-4 gap-0.5">
          <CardTitle className="flex gap-2 items-center text-sm">
            Filtros de Búsqueda
          </CardTitle>
          <CardDescription className="text-xs">
            Filtre los menús por nombre{!fixedModuleId && ", módulo"} o estado
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4">
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 ${
              fixedModuleId ? "lg:grid-cols-2" : "lg:grid-cols-3"
            } gap-4`}
          >
            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-medium text-gray-700">
                Buscar por nombre
              </label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Buscar por nombre..."
                  className="pl-10 pr-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2"
                  defaultValue={menuName}
                  onChange={(e) => debounceName(e.target.value)}
                />
              </div>
            </div>

            {!fixedModuleId && (
              <div className="flex flex-col w-full">
                <label className="mb-1 text-sm font-medium text-gray-700">
                  Módulo
                </label>
                <Select
                  onValueChange={(value) => {
                    setModuleId(value);
                    setPage(1);
                  }}
                  defaultValue={moduleId}
                >
                  <SelectTrigger className="h-10 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <SelectValue placeholder="Seleccione un módulo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="*">Todos</SelectItem>
                    {(modulesQuery.data?.data.items ?? []).map((module) => (
                      <SelectItem key={module.id} value={String(module.id)}>
                        {module.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-medium text-gray-700">
                Estado
              </label>
              <Select
                onValueChange={(value) => {
                  setStatus(value);
                  setPage(1);
                }}
                defaultValue={status}
              >
                <SelectTrigger className="h-10 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Seleccione un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="*">Todos</SelectItem>
                  <SelectItem value="true">Activos</SelectItem>
                  <SelectItem value="false">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      <TableMenus
        columns={[
          {
            accessorKey: "menuName",
            header: () => (
              <div className="flex items-center gap-2">
                <ListTreeIcon className="h-4 w-4" />
                Nombre
              </div>
            ),
            cell: ({ row }) => (
              <div className="flex items-center gap-x-2">
                {row.original.parentId && (
                  <span className="text-gray-300">└</span>
                )}
                {row.original.menuName}
              </div>
            ),
          },
          ...(fixedModuleId
            ? []
            : [
                {
                  accessorKey: "module",
                  header: () => <div>Módulo</div>,
                  cell: ({ row }: any) => (
                    <span>{row.original.module?.name ?? "-"}</span>
                  ),
                },
              ]),
          {
            accessorKey: "url",
            header: () => (
              <div className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                Ruta
              </div>
            ),
            cell: ({ row }) => (
              <span className="text-xs text-gray-500">
                {row.original.url ?? "—"}
              </span>
            ),
          },
          {
            accessorKey: "status",
            header: () => (
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Estado
              </div>
            ),
            cell: ({ row }) => (
              <Badge>{row.original.status ? "Activo" : "Inactivo"}</Badge>
            ),
          },
          {
            id: "actions",
            header: () => (
              <div className="flex items-center justify-center gap-2">
                <Settings className="h-4 w-4" />
                Acciones
              </div>
            ),
            cell: ({ row }) => (
              <div className="flex justify-center">
                <UpdateMenu menu={row.original} fixedModuleId={fixedModuleId} />
              </div>
            ),
          },
        ]}
        data={query.data?.data.items ?? []}
        meta={{
          ...query.data?.data.meta,
          onChangePage: (p) => setPage(p),
          onNextPage: () => setPage((p) => p + 1),
          disabledNextPage: page >= (query.data?.data.meta.totalPages ?? 0),
          onPreviousPage: () => setPage((p) => p - 1),
          disabledPreviousPage: page <= 1,
          setSearchParams: () => {},
        }}
        isLoading={query.isLoading}
      />
    </div>
  );
}
