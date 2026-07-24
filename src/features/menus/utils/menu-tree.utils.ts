import { MenuAdmin } from "../domain/menus.domain";

const MAX_MENU_DEPTH = 3;
const MAX_HOPS = MAX_MENU_DEPTH + 5;

export function getMenuDepth(menu: MenuAdmin, menusById: Map<number, MenuAdmin>): number {
    let depth = 1;
    let current = menu;
    let hops = 0;
    while (current.parentId && hops++ < MAX_HOPS) {
        const parent = menusById.get(current.parentId);
        if (!parent) break;
        depth++;
        current = parent;
    }
    return depth;
}

export function isDescendantOf(
    menu: MenuAdmin,
    ancestorId: number,
    menusById: Map<number, MenuAdmin>
): boolean {
    let current = menu;
    let hops = 0;
    while (current.parentId && hops++ < MAX_HOPS) {
        if (current.parentId === ancestorId) return true;
        const parent = menusById.get(current.parentId);
        if (!parent) break;
        current = parent;
    }
    return false;
}

export { MAX_MENU_DEPTH };
