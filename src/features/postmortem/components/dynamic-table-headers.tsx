import { TableHead, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { GroupedColumn } from "../domain/species-disease.types";
import { Loader2, ChevronRight, ChevronDown } from "lucide-react";

type DynamicTableHeadersProps = {
  groupedColumns: GroupedColumn[];
  isLoading: boolean;
  expandedOrgans: Set<string>;
  onToggleOrgan: (organ: string) => void;
};

export function DynamicTableHeaders({
  groupedColumns,
  isLoading,
  expandedOrgans,
  onToggleOrgan,
}: DynamicTableHeadersProps) {
  if (isLoading || groupedColumns.length === 0) {
    return (
      <>
        <TableRow className="border-b-2">
          <TableHead
            rowSpan={3}
            className="w-[130px] sm:w-[145px] bg-white align-middle sticky left-0 z-30 border-r-2 text-left font-bold px-1.5 text-[10px] sm:text-xs"
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

  // Calcular el total de columnas considerando el estado expandido/colapsado
  const totalColumns = groupedColumns.reduce((sum, group) => {
    const isExpanded = expandedOrgans.has(group.product);
    return sum + (isExpanded ? group.diseases.length : 1);
  }, 0);

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
          className="w-[130px] sm:w-[145px] bg-white align-middle sticky left-0 z-30 border-r-2 text-left font-bold px-1.5 text-[10px] sm:text-xs"
        >
          INTRODUCTOR
        </TableHead>
        <TableHead
          className="bg-blue-200 text-gray-900 font-bold text-center text-xs py-1"
          colSpan={totalColumns + 1}
        >
          SUBPRODUCTOS
        </TableHead>
        <TableHead
          className="bg-purple-200 text-gray-900 font-bold text-center text-xs py-1"
          colSpan={2}
        >
          PRODUCTOS
        </TableHead>
      </TableRow>

      {/* Fila 2: Productos agrupados (Hígado, Pulmón, etc.) + TOTAL */}
      <TableRow className="border-b h-[55px]">
        {groupedColumns.map((group, groupIndex) => {
          const colors = getProductColor(group.product);
          const isExpanded = expandedOrgans.has(group.product);
          const colSpan = isExpanded ? group.diseases.length : 1;
          
          return (
            <TableHead
              key={`product-${groupIndex}`}
              className={`${colors.bg} text-gray-900 font-semibold text-center cursor-pointer hover:opacity-80 transition-opacity ${
                isExpanded ? 'text-sm px-2' : 'text-[10px] px-1 w-[45px]'
              }`}
              colSpan={colSpan}
              onClick={() => onToggleOrgan(group.product)}
            >
              {isExpanded ? (
                // Expandido: Texto horizontal con icono - misma altura
                <div className="flex items-center justify-center gap-1 h-[55px]">
                  <ChevronDown className="h-3 w-3" />
                  <span className="text-xs">{(group.product ?? "").toUpperCase()}</span>
                </div>
              ) : (
                // Colapsado: Texto vertical con Tooltip para ver nombre completo
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center justify-center h-[80px] cursor-pointer">
                        <div className="flex flex-col items-center h-full justify-center">
                          <ChevronRight className="h-3 w-3 flex-shrink-0 mb-1" />
                          <span
                            className="text-[10px] font-medium truncate max-h-[60px] overflow-hidden"
                            style={{
                              writingMode: 'vertical-rl',
                              textOrientation: 'mixed',
                              transform: 'rotate(180deg)',
                              display: 'block',
                            }}
                          >
                            {(group.product ?? "").toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="bg-gray-900 text-white text-xs px-3 py-2">
                      <p className="font-medium">{(group.product ?? "").toUpperCase()}</p>
                      <p className="text-gray-300 text-[10px]">Click para expandir</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </TableHead>
          );
        })}
        <TableHead
          className="bg-orange-200 text-gray-900 font-bold text-center text-[10px] w-[45px]"
          rowSpan={2}
        >
          <div className="flex items-center justify-center h-[180px]">
            <span
              style={{
                writingMode: 'vertical-rl',
                textOrientation: 'mixed',
                transform: 'rotate(180deg)',
              }}
            >
              TOTAL
            </span>
          </div>
        </TableHead>
        <TableHead
          className="bg-purple-200 text-gray-900 font-semibold text-center text-[10px] w-[45px]"
          rowSpan={2}
        >
          <div className="flex items-center justify-center h-[180px]">
            <span
              style={{
                writingMode: 'vertical-rl',
                textOrientation: 'mixed',
                transform: 'rotate(180deg)',
              }}
            >
              Decomiso Total
            </span>
          </div>
        </TableHead>
        <TableHead
          className="bg-purple-200 text-gray-900 font-semibold text-center text-[10px] w-[45px]"
          rowSpan={2}
        >
          <div className="flex items-center justify-center h-[180px]">
            <span
              style={{
                writingMode: 'vertical-rl',
                textOrientation: 'mixed',
                transform: 'rotate(180deg)',
              }}
            >
              Decomiso Parcial
            </span>
          </div>
        </TableHead>
      </TableRow>

      {/* Fila 3: Enfermedades individuales */}
      <TableRow className="border-b-2 h-[100px]">
        {groupedColumns.map((group, groupIndex) => {
          const colors = getProductColor(group.product);
          const isExpanded = expandedOrgans.has(group.product);
          
          if (!isExpanded) {
            // Colapsado: Mostrar "Total" en vertical SIN animación
            return (
              <TableHead
                key={`${groupIndex}-collapsed`}
                className={`${colors.bgLight} text-gray-900 text-center text-[7px] font-normal px-1 w-[45px] h-[100px]`}
              >
                <div className="flex items-center justify-center h-full">
                  <span
                    className="text-[8px]"
                    style={{
                      writingMode: 'vertical-rl',
                      textOrientation: 'mixed',
                      transform: 'rotate(180deg)',
                    }}
                  >
                    Total
                  </span>
                </div>
              </TableHead>
            );
          }
          
          // Expandido: Mostrar enfermedades en VERTICAL con Tooltip para ver nombre completo
          return group.diseases.map((disease, diseaseIndex) => (
            <TableHead
              key={`${groupIndex}-${diseaseIndex}`}
              className={`${colors.bgLight} text-gray-900 text-center text-[7px] font-normal px-1 w-[45px] h-[100px]`}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-center h-full cursor-help">
                      <span
                        className="text-[8px] truncate max-h-[80px] overflow-hidden"
                        style={{
                          writingMode: 'vertical-rl',
                          textOrientation: 'mixed',
                          transform: 'rotate(180deg)',
                          display: 'block',
                        }}
                      >
                        {disease.name}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-gray-900 text-white text-xs px-3 py-2 max-w-[200px]">
                    <p className="font-medium">{disease.name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableHead>
          ));
        })}
      </TableRow>
    </>
  );
}
