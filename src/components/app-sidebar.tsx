"use client";

import * as React from "react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { RoleSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { LoginResponse } from "@/features/security/domain";
import { AdministrationMenu } from "@/features/modules/domain/module.domain";

// This is sample data.
// const data: {
//   user: any;
//   teams: any;
//   navMain: {
//     title: string;
//     url: string;
//     icon: LucideIconName | null;
//     isActive?: boolean;
//     items?: {
//       title: string;
//       url: string;
//       icon?: LucideIconName;
//     }[];
//   }[];
// } = {
//   user: {
//     name: "shadcn",
//     email: "m@example.com",
//     avatar: "/avatars/shadcn.jpg",
//   },
//   teams: [
//     {
//       name: "Acme Inc",
//       logo: GalleryVerticalEnd,
//       plan: "Enterprise",
//     },
//     {
//       name: "Acme Corp.",
//       logo: AudioWaveform,
//       plan: "Startup",
//     },
//     {
//       name: "Evil Corp.",
//       logo: Command,
//       plan: "Free",
//     },
//   ],
//   navMain: [
//     {
//       title: "Párametros",
//       url: "#",
//       icon: "sliders-vertical",
//       isActive: true,
//       items: [
//         {
//           title: "Personas",
//           url: "/dashboard/people",
//           icon: "users",
//         },
//         {
//           title: "Transportistas",
//           url: "/dashboard/carriers",
//           icon: "truck",
//         },
//         {
//           title: "Vehículos",
//           url: "#",
//         },
//         {
//           title: "Destinatarios",
//           url: "#",
//         },
//         {
//           title: "Cronogramas",
//           url: "/dashboard/schedule",
//         },
//       ],
//     },
//     {
//       title: "Seguridad",
//       url: "#",
//       icon: "shield",
//       items: [
//         {
//           title: "Personal",
//           url: "/dashboard/security",
//         },
//         {
//           title: "Introductores",
//           url: "/dashboard/security/introducers",
//         },
//         {
//           title: "Roles",
//           url: "/dashboard/security/roles",
//         },
//       ],
//     },
//     {
//       title: "Recepción",
//       url: "#",
//       icon: "users",
//       items: [
//         {
//           title: "Registro de Ingreso de Animales",
//           icon: "clipboard-list",
//           url: "",
//         },
//         {
//           title: "Corrales",
//           icon: "house",
//           url: "/dashboard/corrals",
//         },
//       ],
//     },
//     {
//       title: "Historial",
//       url: "#",
//       icon: "archive",
//       items: [
//         {
//           title: "Lista de Ingreso de Animales",
//           icon: "file-text",
//           url: "/dashboard/list-animals",
//         },
//       ],
//     },

//     {
//       title: "Control Acceso Vehicular",
//       url: "#",
//       icon: "shield-check",
//       items: [
//         {
//           title: "Registro Diario Ingreso Vehículos",
//           url: "/dashboard/disinfectant/register",
//         },
//       ],
//     },
//     {
//       title: "Inspección Sanitária",
//       url: "#",
//       icon: "stethoscope",
//       items: [
//         {
//           title: "Antemortem",
//           icon: "eye",
//           url: "/dashboard/antemortem",
//         },
//       ],
//     },
//     {
//       title: "Reportes",
//       url: "#",
//       icon: "book-open",
//       //   items: [
//       //     {
//       //       title: "Introduction",
//       //       url: "#",
//       //     },
//       //     {
//       //       title: "Get Started",
//       //       url: "#",
//       //     },
//       //     {
//       //       title: "Tutorials",
//       //       url: "#",
//       //     },
//       //     {
//       //       title: "Changelog",
//       //       url: "#",
//       //     },
//       //   ],
//     },
//     // {
//     //   title: "Settings",
//     //   url: "#",
//     //   icon: Settings2,
//     //   items: [
//     //     {
//     //       title: "General",
//     //       url: "#",
//     //     },
//     //     {
//     //       title: "Team",
//     //       url: "#",
//     //     },
//     //     {
//     //       title: "Billing",
//     //       url: "#",
//     //     },
//     //     {
//     //       title: "Limits",
//     //       url: "#",
//     //     },
//     //   ],
//     // },
//   ],
//   //   projects: [
//   //     {
//   //       name: "Design Engineering",
//   //       url: "#",
//   //       icon: Frame,
//   //     },
//   //     {
//   //       name: "Sales & Marketing",
//   //       url: "#",
//   //       icon: PieChart,
//   //     },
//   //     {
//   //       name: "Travel",
//   //       url: "#",
//   //       icon: Map,
//   //     },
//   //   ],
// };

export function AppSidebar({
 
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: LoginResponse;
  menus: AdministrationMenu[];
}) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <RoleSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain menus={props.menus} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={props.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
