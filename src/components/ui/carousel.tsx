"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type CarouselContextType = {
  currentIndex: number;
  goToSlide: (index: number) => void;
  goToPrevious: () => void;
  goToNext: () => void;
  slidesCount: number;
};

const CarouselContext = React.createContext<CarouselContextType | null>(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);
  if (!context) {
    throw new Error("useCarousel must be used within Carousel");
  }
  return context;
}

interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  autoplay?: boolean;
  autoplayInterval?: number;
}

const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(
  ({ className, children, autoplay = true, autoplayInterval = 4000, ...props }, ref) => {
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const [slidesCount, setSlidesCount] = React.useState(0);

    const goToSlide = React.useCallback((index: number) => {
      setCurrentIndex(index);
    }, []);

    const goToPrevious = React.useCallback(() => {
      setCurrentIndex((prev) => (prev === 0 ? slidesCount - 1 : prev - 1));
    }, [slidesCount]);

    const goToNext = React.useCallback(() => {
      setCurrentIndex((prev) => (prev === slidesCount - 1 ? 0 : prev + 1));
    }, [slidesCount]);

    // Autoplay effect
    React.useEffect(() => {
      if (!autoplay || slidesCount <= 1) return;

      const interval = setInterval(() => {
        goToNext();
      }, autoplayInterval);

      return () => clearInterval(interval);
    }, [autoplay, autoplayInterval, slidesCount, goToNext]);

    const value = React.useMemo(
      () => ({ currentIndex, goToSlide, goToPrevious, goToNext, slidesCount }),
      [currentIndex, goToSlide, goToPrevious, goToNext, slidesCount]
    );

    return (
      <CarouselContext.Provider value={value}>
        <div ref={ref} className={cn("relative group", className)} {...props}>
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child) && child.type === CarouselContent) {
              return React.cloneElement(child, { setSlidesCount } as any);
            }
            return child;
          })}
        </div>
      </CarouselContext.Provider>
    );
  }
);
Carousel.displayName = "Carousel";

interface CarouselContentProps extends React.HTMLAttributes<HTMLDivElement> {
  setSlidesCount?: (count: number) => void;
}

const CarouselContent = React.forwardRef<HTMLDivElement, CarouselContentProps>(
  ({ className, children, setSlidesCount, ...props }, ref) => {
    const { currentIndex } = useCarousel();

    React.useEffect(() => {
      const count = React.Children.count(children);
      setSlidesCount?.(count);
    }, [children, setSlidesCount]);

    return (
      <div ref={ref} className={cn("overflow-hidden", className)} {...props}>
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {children}
        </div>
      </div>
    );
  }
);
CarouselContent.displayName = "CarouselContent";

const CarouselItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("min-w-full flex-shrink-0", className)}
        {...props}
      />
    );
  }
);
CarouselItem.displayName = "CarouselItem";

const CarouselPrevious = React.forwardRef<
  HTMLButtonElement,
  React.HTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  const { goToPrevious, slidesCount } = useCarousel();

  if (slidesCount <= 1) return null;

  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "absolute left-4 top-1/2 -translate-y-1/2 z-[100] h-14 w-14 rounded-full bg-white hover:bg-gray-50 border-2 border-gray-300 shadow-2xl transition-all duration-200 hover:scale-110 flex items-center justify-center",
        className
      )}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        goToPrevious();
      }}
      {...props}
    >
      <ChevronLeft className="h-7 w-7 text-gray-800" />
      <span className="sr-only">Previous</span>
    </button>
  );
});
CarouselPrevious.displayName = "CarouselPrevious";

const CarouselNext = React.forwardRef<
  HTMLButtonElement,
  React.HTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  const { goToNext, slidesCount } = useCarousel();

  if (slidesCount <= 1) return null;

  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "absolute right-4 top-1/2 -translate-y-1/2 z-[100] h-14 w-14 rounded-full bg-white hover:bg-gray-50 border-2 border-gray-300 shadow-2xl transition-all duration-200 hover:scale-110 flex items-center justify-center",
        className
      )}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        goToNext();
      }}
      {...props}
    >
      <ChevronRight className="h-7 w-7 text-gray-800" />
      <span className="sr-only">Next</span>
    </button>
  );
});
CarouselNext.displayName = "CarouselNext";

const CarouselIndicators = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { currentIndex, goToSlide, slidesCount } = useCarousel();

    if (slidesCount <= 1) return null;

    return (
      <div
        ref={ref}
        className={cn(
          "absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-50",
          className
        )}
        {...props}
      >
        {Array.from({ length: slidesCount }).map((_, index) => (
          <button
            key={index}
            type="button"
            className={cn(
              "h-2.5 rounded-full transition-all duration-300",
              currentIndex === index
                ? "w-8 bg-teal-600"
                : "w-2.5 bg-gray-400 hover:bg-gray-600"
            )}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    );
  }
);
CarouselIndicators.displayName = "CarouselIndicators";

export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselIndicators,
};
