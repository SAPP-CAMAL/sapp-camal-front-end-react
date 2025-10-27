"use client";

import { ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import DynamicLucideIcon from "@/lib/lucide-icon-dynamic";
import { AdministrationMenu } from "@/features/modules/domain/module.domain";

export function NavMain({ menus }: { menus: AdministrationMenu[] }) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Módulos</SidebarGroupLabel>
      <SidebarMenu>
        {menus.map((menu) => {
          // Verificar si algún hijo está activo
          const hasActiveChild = menu.children?.some(
            (child) => child.url && pathname === child.url
          );

          return (
            <Collapsible
              key={menu.id}
              asChild
              defaultOpen={hasActiveChild}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={menu.menuName}>
                    {menu.icon && (
                      <DynamicLucideIcon
                        name={(menu?.icon as any) ?? "badge-info"}
                      />
                    )}
                    <span className="font-semibold">{menu.menuName}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent className="transition-all duration-200">
                  <SidebarMenuSub>
                    {menu.children?.map((subItem) => {
                      const isActive = !!(subItem.url && pathname === subItem.url);
                      
                      return (
                        <SidebarMenuSubItem key={subItem.id}>
                          <SidebarMenuSubButton 
                            asChild 
                            isActive={isActive}
                            data-active={isActive}
                          >
                            <Link href={subItem.url ?? "#"} className="no-underline">
                              {/* {subItem.icon && <subItem.icon className="mr-2 h-4 w-4" />} */}
                              <DynamicLucideIcon
                                name={(subItem?.icon as any) ?? "badge-info"}
                                className="mr h-4 w-4"
                              />

                              <span className="font-semibold text-xs">
                                {subItem.menuName}
                              </span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

// {items.map((item) => (
//   <Collapsible
//     key={item.title}
//     asChild
//     defaultOpen={item.isActive}
//     className="group/collapsible"
//   >
//     <SidebarMenuItem>
//       <CollapsibleTrigger asChild>
//         <SidebarMenuButton tooltip={item.title}>
//           {item.icon && (
//             <DynamicLucideIcon
//               name={(item?.icon as any) ?? "badge-info"}
//             />
//           )}
//           <span className="font-semibold">{item.title}</span>
//           <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
//         </SidebarMenuButton>
//       </CollapsibleTrigger>
//       <CollapsibleContent>
//         <SidebarMenuSub>
//           {item.items?.map((subItem) => (
//             <SidebarMenuSubItem key={subItem.title}>
//               <SidebarMenuSubButton asChild>
//                 <Link href={subItem.url}>
//                   {/* {subItem.icon && <subItem.icon className="mr-2 h-4 w-4" />} */}
//                   <DynamicLucideIcon
//                     name={(subItem?.icon as any) ?? "badge-info"}
//                     className="mr h-4 w-4"
//                   />

//                   <span className="font-semibold text-xs">
//                     {subItem.title}
//                   </span>
//                 </Link>
//               </SidebarMenuSubButton>
//             </SidebarMenuSubItem>
//           ))}
//         </SidebarMenuSub>
//       </CollapsibleContent>
//     </SidebarMenuItem>
//   </Collapsible>
// ))}
