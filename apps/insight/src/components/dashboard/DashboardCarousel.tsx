'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DashboardCarouselProps {
    children: React.ReactNode[];
}

export default function DashboardCarousel({ children }: DashboardCarouselProps) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const totalSlides = children.length;

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    };

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
    };

    return (
        <div className="relative">
            {/* Carousel Container - using grid to show only current slide */}
            <div className="relative">
                {children.map((child, index) => (
                    <div
                        key={index}
                        className={`transition-opacity duration-500 ${index === currentSlide ? 'opacity-100' : 'opacity-0 absolute top-0 left-0 w-full pointer-events-none'
                            }`}
                    >
                        {child}
                    </div>
                ))}
            </div>

            {/* Navigation Buttons */}
            {totalSlides > 1 && (
                <div className="flex justify-center gap-4 mt-4">
                    <button
                        onClick={prevSlide}
                        disabled={currentSlide === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 border border-border rounded-lg text-foreground font-medium transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                        aria-label="Previous"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Previous</span>
                    </button>

                    <button
                        onClick={nextSlide}
                        disabled={currentSlide === totalSlides - 1}
                        className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                        aria-label="Next"
                    >
                        <span>Next</span>
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Dot Indicators with Counter */}
            {totalSlides > 1 && (
                <div className="flex justify-center items-center gap-3 mt-2">
                    <span className="text-xs text-muted-foreground">
                        {currentSlide + 1}/{totalSlides}
                    </span>
                    {Array.from({ length: totalSlides }).map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`h-2 rounded-full transition-all ${index === currentSlide
                                ? 'bg-primary w-8'
                                : 'bg-muted-foreground/30 w-2 hover:bg-muted-foreground/50'
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
