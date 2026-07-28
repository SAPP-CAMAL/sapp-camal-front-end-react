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

export type MenuTreeNode = MenuAdmin & { depth: number; hasChildren: boolean };

export function sortMenusAsTree(menus: MenuAdmin[]): MenuTreeNode[] {
    const idsInSet = new Set(menus.map((menu) => menu.id));
    const childrenByParent = new Map<number, MenuAdmin[]>();

    for (const menu of menus) {
        if (menu.parentId != null && idsInSet.has(menu.parentId)) {
            if (!childrenByParent.has(menu.parentId)) childrenByParent.set(menu.parentId, []);
            childrenByParent.get(menu.parentId)!.push(menu);
        }
    }

    const byOrder = (a: MenuAdmin, b: MenuAdmin) =>
        (a.orderIndex ?? a.sequence ?? 0) - (b.orderIndex ?? b.sequence ?? 0);

    for (const children of childrenByParent.values()) children.sort(byOrder);

    const result: MenuTreeNode[] = [];
    const visited = new Set<number>();

    function visit(menu: MenuAdmin, depth: number) {
        if (visited.has(menu.id)) return;
        visited.add(menu.id);
        const children = childrenByParent.get(menu.id) ?? [];
        result.push({ ...menu, depth, hasChildren: children.length > 0 });
        for (const child of children) visit(child, depth + 1);
    }

    const roots = menus
        .filter((menu) => menu.parentId == null || !idsInSet.has(menu.parentId))
        .sort(byOrder);

    for (const root of roots) visit(root, 1);

    return result;
}

export { MAX_MENU_DEPTH };
