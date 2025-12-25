"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { Footer } from "@/components/footer";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { LoginResponse } from "@/features/security/domain";
import { AdministrationMenu } from "@/features/modules/domain/module.domain";

interface DashboardLayoutClientProps {
  menus: AdministrationMenu[];
  user: LoginResponse;
  children: React.ReactNode;
}

export function DashboardLayoutClient({
  menus,
  user,
  children,
}: DashboardLayoutClientProps) {
  return (
    <SidebarProvider>
      <AppSidebar menus={menus} user={user} />
      <SidebarInset>
        <div className="min-h-screen flex flex-col">
          <header className="flex h-14 md:h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b sticky top-0 bg-background z-10">
            <div className="flex items-center gap-2 px-3 md:px-4">
              <SidebarTrigger className="-ml-1" />
            </div>
          </header>
          <main className="flex-1 p-3 md:p-4 pt-0 pb-16">{children}</main>
          <div className="pb-8">
            <Footer />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
