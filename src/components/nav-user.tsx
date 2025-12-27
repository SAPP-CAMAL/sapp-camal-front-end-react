"use client";

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { logoutAction } from "@/features/security/server/actions/security.actions";
import { useRouter } from "next/navigation";
import { LoginResponse } from "@/features/security/domain";
import { fixUtf8 } from "@/lib/utils";


export function NavUser({ user }: { user: LoginResponse }) {
  const { isMobile } = useSidebar();
  const navigate = useRouter();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg uppercase">
                  {user.user.userName.substring(0, 1)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium py-0.5 leading-normal">
                  {fixUtf8(user.user.fullName)}
                </span>
                <span className="truncate text-xs">{fixUtf8(user.user.email)}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg uppercase">
                    {user.user.userName.substring(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium py-0.5 leading-normal">
                    {fixUtf8(user.user.fullName)}
                  </span>
                  <span className="truncate text-xs">{fixUtf8(user.user.email)}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            {/* <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator /> */}
            <DropdownMenuItem
              onClick={async () => {
                try {
                  // Llamar al logout en el servidor (borra cookies del servidor)
                  await logoutAction();
                  
                  // Limpiar también en el cliente
                  if (typeof window !== "undefined") {
                    // Borrar localStorage
                    window.localStorage.removeItem("accessToken");
                    window.localStorage.removeItem("refreshToken");
                    window.localStorage.removeItem("user");
                    
                    // Borrar cookies del navegador
                    document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
                    document.cookie = "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
                    document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
                  }
                  
                  // Redirigir al login
                  navigate.push("/auth/login");
                } catch (error) {
                  console.error("Logout error:", error);
                  // Redirigir al login incluso si falla
                  navigate.push("/auth/login");
                }
              }}
            >
              <LogOut />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
