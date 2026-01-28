import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    { label: "NORMAL", value: "NORMAL", count: counts.normal },
    { label: "EMERGENCIA", value: "EMERGENCIA", count: counts.emergencia },
  ];

  return (
    <>
      {/* Botones para Desktop (pantallas grandes) */}
      <div className="hidden sm:flex gap-2 mb-4">
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

      {/* Select para Móvil/Tablet */}
      <div className="sm:hidden w-full mb-4">
        <Select
          value={selectedFilter}
          onValueChange={(value) => onFilterChange(value as CorralTypeFilter)}
        >
          <SelectTrigger className="w-full bg-white border-teal-600">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {filters.map((filter) => (
              <SelectItem key={filter.value} value={filter.value}>
                {filter.label} ({filter.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
