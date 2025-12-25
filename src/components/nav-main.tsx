"use client";

import { ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

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
import { fixUtf8 } from "@/lib/utils";


// Función helper para normalizar URLs
function normalizeMenuUrl(url: string | null): string {
  if (!url) return "#";
  let cleanUrl = url;
  if (cleanUrl.startsWith("/dashboard/")) {
    cleanUrl = cleanUrl.substring(10);
  } else if (cleanUrl.startsWith("dashboard/")) {
    cleanUrl = cleanUrl.substring(9);
  } else if (cleanUrl.startsWith("/dashboard")) {
    cleanUrl = cleanUrl.substring(10);
  } else if (cleanUrl.startsWith("dashboard")) {
    cleanUrl = cleanUrl.substring(9);
  }
  if (!cleanUrl.startsWith("/")) {
    cleanUrl = "/" + cleanUrl;
  }
  return `/dashboard${cleanUrl}`;
}

export function NavMain({ menus }: { menus: AdministrationMenu[] }) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<Record<number, boolean>>({});
  const [isHydrated, setIsHydrated] = useState(false);

  // Después de la hidratación, abrir los menús que tienen hijos activos
  useEffect(() => {
    setIsHydrated(true);
    const newOpenMenus: Record<number, boolean> = {};
    menus.forEach((menu) => {
      const hasActiveChild = menu.children?.some((child) => {
        const normalizedUrl = normalizeMenuUrl(child.url);
        return pathname === normalizedUrl;
      });
      if (hasActiveChild) {
        newOpenMenus[menu.id] = true;
      }
    });
    setOpenMenus(newOpenMenus);
  }, [pathname, menus]);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Módulos</SidebarGroupLabel>
      <SidebarMenu>
        {menus.map((menu) => {
          const isOpen = isHydrated ? openMenus[menu.id] ?? false : false;

          return (
            <Collapsible
              key={menu.id}
              asChild
              open={isOpen}
              onOpenChange={(open) =>
                setOpenMenus((prev) => ({ ...prev, [menu.id]: open }))
              }
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={fixUtf8(menu.menuName)}>
                    {menu.icon && (
                      <DynamicLucideIcon
                        name={(menu?.icon as any) ?? "badge-info"}
                      />
                    )}
                    <span className="font-semibold">{fixUtf8(menu.menuName)}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {menu.children?.map((subItem) => {
                      const normalizedUrl = normalizeMenuUrl(subItem.url);
                      const isActive = pathname === normalizedUrl;
                      
                      return (
                        <SidebarMenuSubItem key={subItem.id}>
                          <SidebarMenuSubButton 
                            asChild 
                            isActive={isActive}
                            data-active={isActive}
                          >
                            <Link href={normalizedUrl} className="no-underline" prefetch={false}>
                              {/* {subItem.icon && <subItem.icon className="mr-2 h-4 w-4" />} */}
                              <DynamicLucideIcon
                                name={(subItem?.icon as any) ?? "badge-info"}
                                className="mr h-4 w-4"
                              />

                              <span className="font-semibold text-xs leading-normal py-0.5">
                                {fixUtf8(subItem.menuName)}
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
