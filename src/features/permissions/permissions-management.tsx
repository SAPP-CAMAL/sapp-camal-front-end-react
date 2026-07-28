"use client";

import { useState } from "react";
import { KeyRoundIcon, LayoutGridIcon } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { getUserRolesService } from "@/features/roles/server/db/roles.service";
import {
  getRolePermissionsService,
  togglePermissionService,
} from "./server/db/permissions.service";
import { RolePermissionMenuItem } from "./domain/permissions.domain";

function groupMenusByParent(menus: RolePermissionMenuItem[]) {
  const byId = new Map(menus.map((menu) => [menu.menuId, menu]));
  const childrenByParent = new Map<number, RolePermissionMenuItem[]>();

  for (const menu of menus) {
    if (menu.parentId != null && byId.has(menu.parentId)) {
      if (!childrenByParent.has(menu.parentId)) childrenByParent.set(menu.parentId, []);
      childrenByParent.get(menu.parentId)!.push(menu);
    }
  }

  const topLevel = menus.filter(
    (menu) => menu.parentId == null || !byId.has(menu.parentId)
  );

  return {
    groups: topLevel.filter((menu) => childrenByParent.has(menu.menuId)),
    ungrouped: topLevel.filter((menu) => !childrenByParent.has(menu.menuId)),
    childrenByParent,
  };
}

/**
 * Pantalla de administración de permisos: para cada rol, permite otorgar o
 * revocar el acceso a cada ítem de menú del sistema.
 */
export function PermissionsManagement() {
  const queryClient = useQueryClient();
  const [roleId, setRoleId] = useState<string>("");

  const rolesQuery = useQuery({
    queryKey: ["roles", "login-for-permissions"],
    queryFn: getUserRolesService,
  });

  const permissionsQuery = useQuery({
    queryKey: ["role-permissions", roleId],
    queryFn: () => getRolePermissionsService(Number(roleId)),
    enabled: !!roleId,
  });

  const [pendingMenuId, setPendingMenuId] = useState<number | null>(null);

  const handleToggle = async (menuId: number, assigned: boolean) => {
    setPendingMenuId(menuId);
    try {
      await togglePermissionService({ roleId: Number(roleId), menuId, assigned });
      await queryClient.invalidateQueries({ queryKey: ["role-permissions", roleId] });
      toast.success(assigned ? "Acceso otorgado" : "Acceso revocado");
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    } finally {
      setPendingMenuId(null);
    }
  };

  const modules = permissionsQuery.data?.data ?? [];

  return (
    <div>
      <section className="mb-4">
        <h1 className="flex items-center gap-x-2 font-semibold text-xl">
          <KeyRoundIcon />
          Permisos por Rol
        </h1>
        <p className="text-gray-600 text-sm mt-1">
          Otorga o revoca el acceso de cada rol a los menús del sistema.
        </p>
      </section>

      <Card className="mb-4 py-3 gap-2">
        <CardHeader className="px-4 gap-0.5">
          <CardTitle className="text-sm">Seleccionar Rol</CardTitle>
          <CardDescription className="text-xs">
            Elige un rol para ver y editar sus permisos
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4">
          <Select onValueChange={setRoleId} value={roleId}>
            <SelectTrigger className="w-full sm:w-80">
              <SelectValue placeholder="Seleccione un rol" />
            </SelectTrigger>
            <SelectContent>
              {(rolesQuery.data?.data ?? []).map((role) => (
                <SelectItem key={role.id} value={String(role.id)}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {!roleId && (
        <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
          <KeyRoundIcon className="h-8 w-8 mx-auto mb-2 opacity-20" />
          <p>Selecciona un rol para ver sus permisos</p>
        </div>
      )}

      {roleId && permissionsQuery.isLoading && (
        <div className="py-12 text-center text-gray-500 animate-pulse">
          Cargando permisos...
        </div>
      )}

      {roleId && !permissionsQuery.isLoading && (
        <div className="bg-white border rounded-lg overflow-hidden">
          <Accordion type="multiple" className="px-2">
            {modules.map((module) => (
              <AccordionItem key={module.moduleId} value={String(module.moduleId)}>
                <AccordionTrigger className="px-4 sm:px-6">
                  <div className="flex items-center gap-2">
                    <LayoutGridIcon className="h-4 w-4" />
                    {module.moduleName}
                    <span className="text-xs text-gray-400 font-normal">
                      ({module.menus.filter((m) => m.assigned).length}/{module.menus.length})
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 sm:px-6">
                  {module.menus.length === 0 ? (
                    <p className="text-sm text-gray-500 py-2">
                      Este módulo no tiene menús configurados.
                    </p>
                  ) : (
                    (() => {
                      const { groups, ungrouped, childrenByParent } = groupMenusByParent(
                        module.menus
                      );
                      return (
                        <div className="space-y-4 pb-2">
                          {groups.map((group) => (
                            <div key={group.menuId} className="border rounded-md p-3 bg-gray-50/50">
                              <div className="flex items-center gap-2 mb-2">
                                <Checkbox
                                  id={`menu-${group.menuId}`}
                                  checked={group.assigned}
                                  disabled={pendingMenuId === group.menuId}
                                  onCheckedChange={(checked) =>
                                    handleToggle(group.menuId, checked === true)
                                  }
                                />
                                <Label
                                  htmlFor={`menu-${group.menuId}`}
                                  className="text-sm font-semibold cursor-pointer"
                                >
                                  {group.menuName}
                                </Label>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pl-6">
                                {(childrenByParent.get(group.menuId) ?? []).map((menu) => (
                                  <div
                                    key={menu.menuId}
                                    className="flex items-center gap-2 border rounded-md p-2 bg-white"
                                  >
                                    <Checkbox
                                      id={`menu-${menu.menuId}`}
                                      checked={menu.assigned}
                                      disabled={pendingMenuId === menu.menuId}
                                      onCheckedChange={(checked) =>
                                        handleToggle(menu.menuId, checked === true)
                                      }
                                    />
                                    <Label
                                      htmlFor={`menu-${menu.menuId}`}
                                      className="text-sm font-normal cursor-pointer"
                                    >
                                      {menu.menuName}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}

                          {ungrouped.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              {ungrouped.map((menu) => (
                                <div
                                  key={menu.menuId}
                                  className="flex items-center gap-2 border rounded-md p-2"
                                >
                                  <Checkbox
                                    id={`menu-${menu.menuId}`}
                                    checked={menu.assigned}
                                    disabled={pendingMenuId === menu.menuId}
                                    onCheckedChange={(checked) =>
                                      handleToggle(menu.menuId, checked === true)
                                    }
                                  />
                                  <Label
                                    htmlFor={`menu-${menu.menuId}`}
                                    className="text-sm font-normal cursor-pointer"
                                  >
                                    {menu.menuName}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })()
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}
    </div>
  );
}
