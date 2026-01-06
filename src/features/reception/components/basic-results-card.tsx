import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Props {
  className?: string;
  leftBlockClass?: string;
  isSelected?: boolean;
  title?: string;
  paragraph?: string;
  editButton?: React.ReactNode;
  onSelect?: (e: React.MouseEvent) => void;
  onRemove?: (e: React.MouseEvent) => void;
}

const defaultStyle = "bg-gray-50 p-3 sm:p-4 rounded-lg border";
const hoverStyle = "hover:bg-gray-100 transition-colors";

export const BasicResultsCard = ({
  className,
  onSelect,
  onRemove,
  leftBlockClass = "flex flex-col gap-0.5 sm:gap-1",
  isSelected = false,
  title = "",
  paragraph = "",
  editButton,
}: Props) => {
  return (
    <div
      style={onSelect ? { cursor: 'pointer' } : undefined}
      className={cn(
        defaultStyle,
        onSelect && hoverStyle,
        className
      )}
      onClick={onSelect}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
        <div className={cn(leftBlockClass, "min-w-0 flex-1")}>
          {isSelected ? (
            <Badge className="w-fit text-xs">{title}</Badge>
          ) : (
            <p className="font-medium text-sm sm:text-base truncate">{title}</p>
          )}
          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
            {paragraph}
          </p>
        </div>

        {isSelected ? (
          <div className="flex gap-2 flex-shrink-0 self-end sm:self-center">
            {editButton}

            {onRemove && (
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-600 hover:border-red-300 h-8 sm:h-9"
                onClick={onRemove}
              >
                <X className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Quitar</span>
              </Button>
            )}
          </div>
        ) : (
          <div className="flex-shrink-0 self-end sm:self-center">
            {editButton}
          </div>
        )}
      </div>
    </div>
  );
};
