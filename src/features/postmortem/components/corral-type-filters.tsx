import { Button } from "@/components/ui/button";
import type { CorralTypeFilter } from "../domain/certificates.types";

type CorralTypeFiltersProps = {
  selectedFilter: CorralTypeFilter;
  onFilterChange: (filter: CorralTypeFilter) => void;
  counts: {
    todos: number;
    normal: number;
    emergencia: number;
  };
};

export function CorralTypeFilters({
  selectedFilter,
  onFilterChange,
  counts,
}: CorralTypeFiltersProps) {
  const filters: { label: string; value: CorralTypeFilter; count: number }[] = [
    { label: "TODOS", value: "TODOS", count: counts.todos },
    // TODO: Descomentar cuando el filtro NORMAL esté listo
    // { label: "NORMAL", value: "NORMAL", count: counts.normal },
    { label: "EMERGENCIA", value: "EMERGENCIA", count: counts.emergencia },
  ];

  return (
    <div className="flex gap-2 mb-4">
      {filters.map((filter) => (
        <Button
          key={filter.value}
          variant={selectedFilter === filter.value ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange(filter.value)}
          className={
            selectedFilter === filter.value
              ? "bg-teal-600 hover:bg-teal-700 text-white"
              : "text-gray-700 hover:bg-gray-100"
          }
        >
          {filter.label} ({filter.count})
        </Button>
      ))}
    </div>
  );
}
