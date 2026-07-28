"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  ListTreeIcon,
  LinkIcon,
  Activity,
  Settings,
  ChevronRightIcon,
  ChevronDownIcon,
  FolderIcon,
  FileIcon,
} from "lucide-react";
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
import { getMenuDepth, sortMenusAsTree } from "./utils/menu-tree.utils";
import { MenuAdmin } from "./domain/menus.domain";

const TREE_GROUPS_PER_PAGE = 5;

export function MenusManagement({ fixedModuleId }: { fixedModuleId?: number } = {}) {
  const [page, setPage] = useState(1);
  const [treePage, setTreePage] = useState(1);
  const limit = fixedModuleId ? 500 : 10;
  const [menuName, setMenuName] = useState("");
  const [moduleId, setModuleId] = useState<string>("*");
  const [status, setStatus] = useState<string>("*");
  const [collapsedIds, setCollapsedIds] = useState<Set<number>>(new Set());

  const toggleCollapse = (id: number) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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

  const rawItems = query.data?.data.items ?? [];
  const menusById = new Map(rawItems.map((menu) => [menu.id, menu]));

  const treeNodes = fixedModuleId
    ? sortMenusAsTree(rawItems)
    : rawItems.map((menu) => ({
        ...menu,
        depth: getMenuDepth(menu, menusById),
        hasChildren: rawItems.some((m) => m.parentId === menu.id),
      }));

  const isVisible = (node: MenuAdmin) => {
    let current = node;
    while (current.parentId) {
      if (collapsedIds.has(current.parentId)) return false;
      const parent = menusById.get(current.parentId);
      if (!parent) break;
      current = parent;
    }
    return true;
  };

  const treeNodesById = new Map(treeNodes.map((node) => [node.id, node]));

  const rootGroups = fixedModuleId
    ? treeNodes.filter((node) => node.depth === 2)
    : [];
  const treeTotalPages = fixedModuleId
    ? Math.max(1, Math.ceil(rootGroups.length / TREE_GROUPS_PER_PAGE))
    : 1;
  const pageGroupIds = new Set(
    rootGroups
      .slice((treePage - 1) * TREE_GROUPS_PER_PAGE, treePage * TREE_GROUPS_PER_PAGE)
      .map((group) => group.id)
  );

  const depth2AncestorId = (node: (typeof treeNodes)[number]): number | null => {
    if (node.depth <= 2) return node.id;
    let currentId: number | null = node.parentId;
    while (currentId != null) {
      const current = treeNodesById.get(currentId);
      if (!current) return null;
      if (current.depth === 2) return current.id;
      currentId = current.parentId;
    }
    return null;
  };

  const nodesForCurrentTreePage = fixedModuleId
    ? treeNodes.filter((node) => {
        if (node.depth === 1) return true;
        const ancestorGroupId = depth2AncestorId(node);
        return ancestorGroupId != null && pageGroupIds.has(ancestorGroupId);
      })
    : treeNodes;

  const visibleNodes = nodesForCurrentTreePage.filter(isVisible);

  const debounceName = useDebouncedCallback((text: string) => {
    setMenuName(text);
    setPage(1);
    setTreePage(1);
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
                  setTreePage(1);
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
            cell: ({ row }) => {
              const node = row.original as (typeof treeNodes)[number];
              const { depth, hasChildren } = node;
              const isCollapsed = collapsedIds.has(node.id);
              return (
                <div
                  className="flex items-center gap-x-1"
                  style={{ paddingLeft: `${(depth - 1) * 24}px` }}
                >
                  {depth > 1 && <span className="text-gray-300 select-none">└─</span>}
                  {hasChildren ? (
                    <button
                      type="button"
                      onClick={() => toggleCollapse(node.id)}
                      className="p-0.5 rounded hover:bg-gray-100 shrink-0"
                    >
                      {isCollapsed ? (
                        <ChevronRightIcon className="h-3.5 w-3.5 text-gray-500" />
                      ) : (
                        <ChevronDownIcon className="h-3.5 w-3.5 text-gray-500" />
                      )}
                    </button>
                  ) : (
                    <span className="w-4 shrink-0" />
                  )}
                  {hasChildren ? (
                    <FolderIcon className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  ) : (
                    <FileIcon className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  )}
                  <span className={hasChildren ? "font-medium" : ""}>
                    {node.menuName}
                  </span>
                </div>
              );
            },
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
        data={visibleNodes}
        meta={
          fixedModuleId
            ? {
                ...query.data?.data.meta,
                currentPage: treePage,
                totalPages: treeTotalPages,
                onChangePage: (p) => setTreePage(p),
                onNextPage: () => setTreePage((p) => p + 1),
                disabledNextPage: treePage >= treeTotalPages,
                onPreviousPage: () => setTreePage((p) => p - 1),
                disabledPreviousPage: treePage <= 1,
                setSearchParams: () => {},
              }
            : {
                ...query.data?.data.meta,
                onChangePage: (p) => setPage(p),
                onNextPage: () => setPage((p) => p + 1),
                disabledNextPage: page >= (query.data?.data.meta.totalPages ?? 0),
                onPreviousPage: () => setPage((p) => p - 1),
                disabledPreviousPage: page <= 1,
                setSearchParams: () => {},
              }
        }
        isLoading={query.isLoading}
      />
    </div>
  );
}
