import { toast } from "sonner";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { AccordionTrigger } from "@/components/ui/accordion";

interface Props {
  stepNumber: number;
  title: string;
  subTitle?: string;
  className?: string;
  isDisabled?: boolean;
  paragraphLines?: string[];
  isDisabledMessage?: string;
  variant?: "success" | "disabled" | "default";
  onClick?: (e: React.MouseEvent) => void;
}

const defaultStyles =
  "hover:no-underline px-3 sm:px-4 hover:bg-gray-50 transition-colors border-b rounded-b-none";

export const BasicAnimalAdmissionAccordionHeader = ({
  stepNumber,
  title,
  subTitle,
  className = "",
  isDisabled = false,
  variant = "default",
  paragraphLines = [],
  isDisabledMessage,
  onClick,
}: Props) => {
  const handleShowDisabledMessage = () => {
    if (isDisabled && isDisabledMessage) toast.error(isDisabledMessage);
  };

  return (
    <div onClick={handleShowDisabledMessage}>
      <AccordionTrigger
        className={cn(
          defaultStyles,
          (isDisabled || variant === "disabled") && "opacity-50",
          className
        )}
        disabled={isDisabled}
        onClick={onClick}
      >
        <div className="flex items-center gap-2 sm:gap-4">
          {variant === "success" ? (
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-colors bg-primary text-white flex-shrink-0">
              <Check className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          ) : (
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-colors text-sm sm:text-base flex-shrink-0">
              {stepNumber}
            </div>
          )}

          <div className="text-left min-w-0">
            <h3 className="text-sm sm:text-lg font-medium flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-3">
              <span className="truncate">{title}</span>
              {subTitle && (
                <span className="text-[10px] sm:text-xs text-gray-400 font-normal">
                  {subTitle}
                </span>
              )}
            </h3>

            {paragraphLines.length > 0 && (
              <div className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 hidden sm:block">
                {paragraphLines.map((line, index) => (
                  <p key={index} className="font-normal truncate">
                    {line}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </AccordionTrigger>
    </div>
  );
};
