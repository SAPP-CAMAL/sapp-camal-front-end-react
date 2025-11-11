"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

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
  slaughterhouseLogo
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
      {/* Carousel Container */}
      <div className="relative h-[600px] bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-gray-200">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50/40 via-white to-cyan-50/40" />

        {/* Static Logos - Always Visible */}
        <div className="absolute top-4 left-4 z-40">
          <Image
            src="/images/LOGO_VERDE_HORIZONTAL.svg"
            alt="Logo SAPP"
            width={150}
            height={60}
            className="object-contain drop-shadow-lg"
            priority
          />
        </div>
        {slaughterhouseLogo && (
          <div className="absolute top-4 right-4 z-40">
            <Image
              src={slaughterhouseLogo}
              alt="Logo Matadero"
              width={190}
              height={150}
              className="object-contain drop-shadow-lg"
              priority
            />
          </div>
        )}

        {/* Welcome Message - Top Center */}
        <div className="absolute top-55 left-1/2 -translate-x-1/2 z-40 text-center w-full px-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent drop-shadow-lg inline-flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
            <span className="whitespace-nowrap">¡Bienvenido, {userName}!</span>
            <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 md:h-9 md:w-9 text-yellow-500 animate-pulse flex-shrink-0" />
          </h1>
        </div>

        {/* Images - Full Size */}
        <div className="relative w-full h-full">
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

        {/* System Info and Role - Bottom Center */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-40 w-full max-w-3xl px-6">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border-2 border-gray-200 p-5">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <p className="text-gray-800 text-lg font-semibold">
                Sistema de Automatización de Procesos Productivos
              </p>
              <Badge className="text-base px-6 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-lg">
                {userRole}
              </Badge>
            </div>
          </div>
        </div>

        {/* Previous Button */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-50 h-14 w-14 rounded-full bg-white hover:bg-gray-100 border-2 border-gray-300 shadow-2xl transition-all duration-200 hover:scale-110 flex items-center justify-center"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-7 w-7 text-gray-800" />
        </button>

        {/* Next Button */}
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-50 h-14 w-14 rounded-full bg-white hover:bg-gray-100 border-2 border-gray-300 shadow-2xl transition-all duration-200 hover:scale-110 flex items-center justify-center"
          aria-label="Next slide"
        >
          <ChevronRight className="h-7 w-7 text-gray-800" />
        </button>

        {/* Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-50">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                index === currentIndex ? "w-8 bg-teal-600" : "w-2.5 bg-gray-400 hover:bg-gray-600"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
