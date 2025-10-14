"use client";

import * as React from "react";
import { ChevronsUpDown } from "lucide-react";
import Image from 'next/image'

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

export function RoleSwitcher() {
  const { isMobile } = useSidebar();
  // const [activeTeam, setActiveTeam] = React.useState(teams[0]);

  const query = useQuery({
    queryKey: ["user-roles"],
    queryFn: () => getUserRolesService(),
  });


  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-primary text-primary-foreground flex items-center justify-center rounded-lg overflow-hidden w-10 h-10">
                <Image
                  src="/images/sapp-b-vertical.png"
                  alt="Logo Camal"
                  className="h-full w-auto object-contain"
                  width={100}
                  height={100}
                />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-medium">CAMAL MUNICIPAL</span>
                <span className="truncate text-xs">RIOBAMBA</span>
              </div>
              <ChevronsUpDown className="ml-auto group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Roles de Usuario
            </DropdownMenuLabel>
            {query.data?.data?.map((role: any) => (
              <RoleItem key={role.id} role={role} />
            ))}
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

function RoleItem({ role }: { role: any }) {
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

          toast.success("Cambio de rol exitoso");
        });
      }}
      className="gap-2 p-2"
    >
      {isPending ? (
        <span className="font-mono text-sm">Cambiando de rol...</span>
      ) : (
        role.name
      )}
    </DropdownMenuItem>
  );
}
