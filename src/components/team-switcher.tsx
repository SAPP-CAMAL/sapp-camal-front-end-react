"use client";

import * as React from "react";
import { ChevronsUpDown, Check } from "lucide-react";
import Image from 'next/image'
import { cn, fixUtf8 } from "@/lib/utils";


import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useQuery } from "@tanstack/react-query";
import { getUserRolesService } from "@/features/security/server/db/security.queries";
import { setUserRoleAction } from "@/features/security/server/actions/security.actions";
import { revalidatePathAction } from "@/features/security/server/actions/revalidate.action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSlaughterhouseInfo } from "@/features/slaughterhouse-info";
import { Role } from "@/features/roles/domain/roles.domain";

function persistActiveRole(role: { id: number; name: string }) {
  localStorage.setItem('activeRoleId', role.id.toString());
  localStorage.setItem('activeRoleName', role.name);

  window.dispatchEvent(
    new CustomEvent('active-role-changed', {
      detail: { id: role.id, name: role.name },
    })
  );
}

export function RoleSwitcher({ activeRole }: { activeRole?: { id: number; name: string } }) {
  const { isMobile } = useSidebar();
  const [open, setOpen] = React.useState(false);
  // Fuente de verdad: el rol activo real de la sesión (viene del cookie "user" leído en el
  // servidor). No se deriva de localStorage ni del primer rol de la lista: eso podía mostrar
  // "Administrador" seleccionado mientras los menús cargados correspondían a otro rol.
  const [activeRoleId, setActiveRoleId] = React.useState<number | null>(activeRole?.id ?? null);
  const [isMounted, setIsMounted] = React.useState(false);
  const { location } = useSlaughterhouseInfo(); // Usar location.canton en el menú

  // Evitar problemas de hidratación
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Si el rol activo de la sesión cambia (ej. tras un cambio de rol y recarga), sincronizar.
  React.useEffect(() => {
    if (activeRole?.id) {
      setActiveRoleId(activeRole.id);
      persistActiveRole({ id: activeRole.id, name: activeRole.name });
    }
  }, [activeRole?.id, activeRole?.name]);

  const query = useQuery({
    queryKey: ["user-roles"],
    queryFn: () => getUserRolesService(),
    retry: 1,
    enabled: isMounted, // Solo ejecutar cuando esté montado en el cliente
  });

  // No renderizar hasta que esté montado en el cliente
  if (!isMounted) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <div className="bg-primary text-primary-foreground flex items-center justify-center rounded-lg overflow-hidden w-10 h-10">
              <Image
                src="/images/sapp-b-vertical.svg"
                alt="Logo Camal"
                className="h-full w-auto object-contain"
                width={100}
                height={100}
              />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
              <span className="truncate font-medium">EMFI</span>
              <span className="truncate text-xs">{location.canton}</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }


  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-primary text-primary-foreground flex items-center justify-center rounded-lg overflow-hidden w-10 h-10">
                <Image
                  src="/images/sapp-b-vertical.svg"
                  alt="Logo Camal"
                  className="h-full w-auto object-contain"
                  width={100}
                  height={100}
                />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-medium">EMFI - {location.canton}</span>
                {/* <span className="truncate text-xs">{location.canton}</span> */}
              </div>
              <ChevronsUpDown className="ml-auto group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg bg-popover shadow-xl border-sidebar-border"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
            onInteractOutside={() => setOpen(false)}
          >
            <DropdownMenuLabel className="p-3 text-sm font-bold uppercase tracking-wider text-primary border-b bg-sidebar-accent/50 rounded-t-lg">
              Roles de Usuario
            </DropdownMenuLabel>
            {query.isLoading ? (
              <DropdownMenuItem disabled className="text-sm text-muted-foreground">
                Cargando roles...
              </DropdownMenuItem>
            ) : query.isError ? (
              <DropdownMenuItem disabled className="text-sm text-destructive">
                Error al cargar roles
              </DropdownMenuItem>
            ) : (
              query.data?.data?.map((role: Role) => (
                <RoleItem 
                  key={role.id} 
                  role={role} 
                  isActive={role.id === activeRoleId}
                  onSelect={() => {
                    setActiveRoleId(role.id);
                    persistActiveRole({ id: role.id, name: role.name });
                    setOpen(false);
                  }}
                />
              ))
            )}
            {/* <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Plus className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">Add team</div>
            </DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function RoleItem({ role, isActive, onSelect }: { role: Role; isActive: boolean; onSelect: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  return (
    <DropdownMenuItem
      key={role.name}
      onClick={(e) => {
        e.preventDefault();
        startTransition(async () => {
          try {
            // Cookies seteadas server-side (Set-Cookie), no dependen de la Cookie Store API del navegador.
            await setUserRoleAction(role.id);

            await revalidatePathAction("/dashboard");

            router.push("/dashboard");

            toast.success("Cambio de rol exitoso");
            onSelect();
          } catch (error) {
            toast.error("No se pudo cambiar de rol. Intente nuevamente.");
          }
        });
      }}
      className={cn(
        "gap-2 p-2 cursor-pointer",
        isActive && "bg-accent text-accent-foreground font-medium"
      )}
    >
      <div className="flex items-center gap-2 flex-1">
        {isActive && <Check className="h-4 w-4 text-primary" />}
        {isPending ? (
          <span className="font-mono text-sm">Cambiando de rol...</span>
        ) : (
          <span className={cn(isActive && "font-semibold")}>{fixUtf8(role.name)}</span>
        )}
      </div>
    </DropdownMenuItem>
  );
}
