import { TableHead, TableRow } from "@/components/ui/table";
import type { GroupedColumn } from "../domain/species-disease.types";
import { Loader2 } from "lucide-react";

type DynamicTableHeadersProps = {
  groupedColumns: GroupedColumn[];
  isLoading: boolean;
};

export function DynamicTableHeaders({
  groupedColumns,
  isLoading,
}: DynamicTableHeadersProps) {
  if (isLoading || groupedColumns.length === 0) {
    return (
      <>
        <TableRow className="border-b-2">
          <TableHead
            rowSpan={3}
            className="w-[200px] bg-white align-middle sticky left-0 z-30 border-r-2 text-left font-bold px-2"
          >
            INTRODUCTOR
          </TableHead>
          <TableHead className="bg-white text-center py-8" colSpan={10}>
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
              <span className="text-sm text-gray-600">Cargando datos...</span>
            </div>
          </TableHead>
        </TableRow>
      </>
    );
  }

  const totalColumns = groupedColumns.reduce(
    (sum, group) => sum + group.diseases.length,
    0
  );

  // Asignar colores según el producto
  const getProductColor = (product: string) => {
    const productLower = product.toLowerCase();
    if (productLower.includes("hígado") || productLower.includes("higado"))
      return { bg: "bg-green-200", bgLight: "bg-green-100" };
    if (productLower.includes("pulmón") || productLower.includes("pulmon"))
      return { bg: "bg-blue-200", bgLight: "bg-blue-100" };
    if (productLower.includes("riñón") || productLower.includes("rinon"))
      return { bg: "bg-yellow-200", bgLight: "bg-yellow-100" };
    if (productLower.includes("intestino"))
      return { bg: "bg-pink-200", bgLight: "bg-pink-100" };
    if (productLower.includes("corazón") || productLower.includes("corazon"))
      return { bg: "bg-red-200", bgLight: "bg-red-100" };
    if (productLower.includes("ubre"))
      return { bg: "bg-purple-200", bgLight: "bg-purple-100" };
    return { bg: "bg-gray-200", bgLight: "bg-gray-100" };
  };

  return (
    <>
      {/* Fila 1: SUBPRODUCTOS y PRODUCTOS */}
      <TableRow className="border-b-2">
        <TableHead
          rowSpan={3}
          className="w-[200px] bg-white align-middle sticky left-0 z-30 border-r-2 text-left font-bold px-2"
        >
          INTRODUCTOR
        </TableHead>
        <TableHead
          className="bg-blue-200 text-gray-900 font-bold text-center"
          colSpan={totalColumns + 1}
        >
          SUBPRODUCTOS
        </TableHead>
        <TableHead
          className="bg-purple-200 text-gray-900 font-bold text-center"
          colSpan={2}
        >
          PRODUCTOS
        </TableHead>
      </TableRow>

      {/* Fila 2: Productos agrupados (Hígado, Pulmón, etc.) + TOTAL */}
      <TableRow className="border-b">
        {groupedColumns.map((group, groupIndex) => {
          const colors = getProductColor(group.product);
          return (
            <TableHead
              key={`product-${groupIndex}`}
              className={`${colors.bg} text-gray-900 font-semibold text-center text-sm`}
              colSpan={group.diseases.length}
            >
              {(group.product ?? "").toUpperCase()}
            </TableHead>
          );
        })}
        <TableHead
          className="bg-orange-200 text-gray-900 font-bold text-center text-sm"
          rowSpan={2}
        >
          TOTAL
        </TableHead>
        <TableHead
          className="bg-purple-200 text-gray-900 font-semibold text-center text-xs"
          rowSpan={2}
        >
          Decomiso Total
        </TableHead>
        <TableHead
          className="bg-purple-200 text-gray-900 font-semibold text-center text-xs"
          rowSpan={2}
        >
          Decomiso Parcial
        </TableHead>
      </TableRow>

      {/* Fila 3: Enfermedades individuales */}
      <TableRow className="border-b-2">
        {groupedColumns.map((group, groupIndex) => {
          const colors = getProductColor(group.product);
          return group.diseases.map((disease, diseaseIndex) => (
            <TableHead
              key={`${groupIndex}-${diseaseIndex}`}
              className={`${colors.bgLight} text-gray-900 text-center text-[10px] font-normal px-1`}
            >
              {disease.name}
            </TableHead>
          ));
        })}
      </TableRow>
    </>
  );
}
