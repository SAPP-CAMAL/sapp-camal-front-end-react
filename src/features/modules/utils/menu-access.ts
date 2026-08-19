import { AdministrationMenu, Child } from "@/features/modules/domain/module.domain";
import { normalizeMenuUrl } from "@/features/modules/utils/normalize-menu-url";

// Rutas del dashboard que no corresponden a un menú específico (home, etc.)
// y por lo tanto deben quedar siempre accesibles para cualquier usuario logueado.
const ALWAYS_ALLOWED_PATHS = ["/dashboard"];

function collectUrls(items: (AdministrationMenu | Child)[], out: Set<string>) {
  for (const item of items) {
    const normalized = normalizeMenuUrl(item.url);
    if (normalized !== "#") out.add(normalized);
    if (item.children?.length) collectUrls(item.children, out);
  }
}

export function isPathAllowedByMenus(menus: AdministrationMenu[], pathname: string): boolean {
  if (ALWAYS_ALLOWED_PATHS.includes(pathname)) return true;

  const allowedUrls = new Set<string>();
  collectUrls(menus, allowedUrls);

  for (const url of allowedUrls) {
    if (pathname === url || pathname.startsWith(`${url}/`)) return true;
  }
  return false;
}
