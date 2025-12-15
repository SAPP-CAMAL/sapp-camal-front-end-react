"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

function isSvgSrc(src: string) {
  return src.toLowerCase().split("?")[0].endsWith(".svg");
}

interface SimpleCarouselProps {
  images: { src: string; alt: string }[];
  autoplayInterval?: number;
  userName?: string;
  userRole?: string;
  slaughterhouseLogo?: string | null;
}

export function SimpleCarousel({
  images,
  autoplayInterval = 4000,
  userName,
  userRole,
  slaughterhouseLogo,
}: SimpleCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, autoplayInterval);

    return () => clearInterval(interval);
  }, [images.length, autoplayInterval]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <div className="relative w-full">
      {/* Carousel Container - altura responsive */}
      <div className="relative h-[350px] sm:h-[450px] md:h-[500px] lg:h-[600px] bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-lg sm:shadow-2xl overflow-hidden border border-gray-200 sm:border-2">
        {/* Gradient Background */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-teal-50/40 via-white to-cyan-50/40" />

        {/* Logos Container - responsive positioning */}
        <div className="absolute top-2 sm:top-3 md:top-4 left-0 right-0 z-50 pointer-events-none px-2 sm:px-3 md:px-4">
          <div className="flex items-start justify-between gap-2">
            {/* Logo SAPP */}
            <div className="rounded-lg px-1 sm:px-2 py-1 bg-white/80 backdrop-blur-sm">
              <img
                src="/images/LOGO_VERDE_HORIZONTAL.svg"
                alt="Logo SAPP"
                className="drop-shadow-lg block w-[80px] sm:w-[110px] md:w-[130px] lg:w-[150px] h-auto"
              />
            </div>

            {/* Logo Matadero */}
            {slaughterhouseLogo && (
              <div className="rounded-lg px-1 sm:px-2 py-1 bg-white/80 backdrop-blur-sm">
                {isSvgSrc(slaughterhouseLogo) ? (
                  <img
                    src={`/api/image-proxy?url=${encodeURIComponent(slaughterhouseLogo)}`}
                    alt="Logo Matadero"
                    className="drop-shadow-lg block w-[80px] sm:w-[120px] md:w-[150px] lg:w-[190px] h-auto max-h-[40px] sm:max-h-[60px] md:max-h-[80px] lg:max-h-[100px] object-contain"
                  />
                ) : (
                  <Image
                    src={slaughterhouseLogo}
                    alt="Logo Matadero"
                    width={190}
                    height={150}
                    className="drop-shadow-lg w-[80px] sm:w-[120px] md:w-[150px] lg:w-[190px] h-auto max-h-[40px] sm:max-h-[60px] md:max-h-[80px] lg:max-h-[100px] object-contain"
                    priority
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Welcome Message - responsive positioning */}
        <div className="absolute top-16 sm:top-20 md:top-24 lg:top-32 left-1/2 -translate-x-1/2 z-40 text-center w-full px-3 sm:px-4">
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent drop-shadow-lg inline-flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
            <span className="whitespace-nowrap">¡Bienvenido, {userName}!</span>
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-9 lg:w-9 text-yellow-500 animate-pulse flex-shrink-0" />
          </h1>
        </div>

        {/* Images - Full Size */}
        <div className="relative w-full h-full z-10">
          {images.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-700 ${
                index === currentIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover"
                priority={index === 0}
              />
            </div>
          ))}
        </div>

        {/* System Info and Role - responsive bottom card */}
        <div className="absolute bottom-12 sm:bottom-14 md:bottom-16 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-1.5rem)] sm:w-[calc(100%-2rem)] md:w-[calc(100%-3rem)] max-w-3xl">
          <div className="bg-white/95 backdrop-blur-md rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg sm:shadow-2xl border border-gray-200 sm:border-2 p-2.5 sm:p-3 md:p-4 lg:p-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 md:gap-4">
              <p className="text-gray-800 text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-center sm:text-left">
                Sistema de Automatización de Procesos Productivos
              </p>
              <Badge className="text-xs sm:text-sm md:text-base px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-md sm:shadow-lg whitespace-nowrap">
                {userRole}
              </Badge>
            </div>
          </div>
        </div>

        {/* Navigation Buttons - responsive size */}
        <button
          onClick={goToPrevious}
          className="absolute left-2 sm:left-3 md:left-4 top-1/2 -translate-y-1/2 z-50 h-9 w-9 sm:h-11 sm:w-11 md:h-12 md:w-12 lg:h-14 lg:w-14 rounded-full bg-white/90 hover:bg-white border border-gray-300 sm:border-2 shadow-lg sm:shadow-2xl transition-all duration-200 hover:scale-110 flex items-center justify-center"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-gray-800" />
        </button>

        <button
          onClick={goToNext}
          className="absolute right-2 sm:right-3 md:right-4 top-1/2 -translate-y-1/2 z-50 h-9 w-9 sm:h-11 sm:w-11 md:h-12 md:w-12 lg:h-14 lg:w-14 rounded-full bg-white/90 hover:bg-white border border-gray-300 sm:border-2 shadow-lg sm:shadow-2xl transition-all duration-200 hover:scale-110 flex items-center justify-center"
          aria-label="Next slide"
        >
          <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-gray-800" />
        </button>

        {/* Indicators - responsive */}
        <div className="absolute bottom-3 sm:bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-50">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "w-5 sm:w-6 md:w-8 bg-teal-600"
                  : "w-2 sm:w-2.5 bg-gray-400 hover:bg-gray-600"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
