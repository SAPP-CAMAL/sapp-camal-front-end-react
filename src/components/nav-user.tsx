"use client";

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  PowerOff,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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


async function performLogout(navigate: ReturnType<typeof useRouter>) {
  try {
    await logoutAction();
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("accessToken");
      window.localStorage.removeItem("refreshToken");
      window.localStorage.removeItem("user");
      window.localStorage.removeItem("activeRoleId");
      window.localStorage.removeItem("activeRoleName");
      window.dispatchEvent(new CustomEvent("active-role-changed", { detail: { id: null, name: null } }));
      document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      document.cookie = "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    }
    navigate.push("/auth/login");
  } catch {
    navigate.push("/auth/login");
  }
}

export function NavUser({ user }: { user: LoginResponse }) {
  const { isMobile } = useSidebar();
  const navigate = useRouter();
  const [showShutdownDialog, setShowShutdownDialog] = useState(false);

  return (
    <>
    <AlertDialog open={showShutdownDialog} onOpenChange={setShowShutdownDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <PowerOff className="size-5 text-destructive" />
            Cerrar Sesión y Apagar
          </AlertDialogTitle>
          <AlertDialogDescription>
            ¿Está seguro que desea cerrar su sesión y apagar esta computadora?
            La computadora se apagará en 10 segundos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-white hover:bg-destructive/90"
            onClick={async () => {
              if (typeof window !== "undefined") {
                window.location.href = "sapp-shutdown://";
              }
              await performLogout(navigate);
            }}
          >
            Sí, apagar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu modal={false}>
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
            <DropdownMenuItem onClick={() => performLogout(navigate)}>
              <LogOut />
              Cerrar Sesión
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => setShowShutdownDialog(true)}
            >
              <PowerOff />
              Cerrar Sesión y Apagar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
    </>
  );
}
