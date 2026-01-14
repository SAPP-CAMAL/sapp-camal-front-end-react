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
import {
  getUserRolesService,
  setUserRoleService,
} from "@/features/security/server/db/security.queries";
import { revalidatePathAction } from "@/features/security/server/actions/revalidate.action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSlaughterhouseInfo } from "@/features/slaughterhouse-info";

export function RoleSwitcher() {
  const { isMobile } = useSidebar();
  const [open, setOpen] = React.useState(false);
  const [activeRoleId, setActiveRoleId] = React.useState<number | null>(null);
  const [isMounted, setIsMounted] = React.useState(false);
  const { location } = useSlaughterhouseInfo(); // Usar location.canton en el menú

  // Evitar problemas de hidratación
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const query = useQuery({
    queryKey: ["user-roles"],
    queryFn: () => getUserRolesService(),
    retry: 1,
    enabled: isMounted, // Solo ejecutar cuando esté montado en el cliente
  });

  // Cargar el rol activo desde localStorage o usar el primer rol del listado
  React.useEffect(() => {
    if (!isMounted || !query.data?.data || query.data.data.length === 0 || activeRoleId !== null) {
      return;
    }

    // Intentar obtener el rol guardado en localStorage (cuando el usuario cambió de rol manualmente)
    const savedRoleId = localStorage.getItem('activeRoleId');
    
    if (savedRoleId) {
      const roleId = parseInt(savedRoleId);
      // Verificar que el rol guardado existe en la lista de roles del usuario
      const roleExists = query.data.data.some((role: any) => role.id === roleId);
      if (roleExists) {
        setActiveRoleId(roleId);
        return;
      }
    }
    
    // Si no hay rol guardado en localStorage, SIEMPRE usar el primer rol del listado
    // Esto asegura que al iniciar sesión siempre se muestre el primer rol
    setActiveRoleId(query.data.data[0].id);
    localStorage.setItem('activeRoleId', query.data.data[0].id.toString());
  }, [query.data, activeRoleId, isMounted]);

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
              <span className="truncate font-medium">CAMAL MUNICIPAL</span>
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
                <span className="truncate font-medium">CAMAL MUNICIPAL</span>
                <span className="truncate text-xs">{location.canton}</span>
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
              query.data?.data?.map((role: any) => (
                <RoleItem 
                  key={role.id} 
                  role={role} 
                  isActive={role.id === activeRoleId}
                  onSelect={() => {
                    setActiveRoleId(role.id);
                    localStorage.setItem('activeRoleId', role.id.toString());
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

function RoleItem({ role, isActive, onSelect }: { role: any; isActive: boolean; onSelect: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  return (
    <DropdownMenuItem
      key={role.name}
      onClick={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const resp = await setUserRoleService(role.id);

          await Promise.all([
            window.cookieStore.set("accessToken", resp.data.accessToken),
            window.cookieStore.set("refreshToken", resp.data.refreshToken),
            window.cookieStore.set("user", JSON.stringify(resp.data)),
          ]);

          await revalidatePathAction("/dashboard");

          router.push("/dashboard");

          toast.success("Cambio de rol exitoso");
          onSelect();
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
