import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const bannerSlides = [
  {
    id: 1,
    title: "NIMDACON #1",
    background: "linear-gradient(135deg, #2c3e50 0%, #3498db 100%)",
  },
  {
    id: 2,
    title: "NIMDA 2026",
    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
  },
  {
    id: 3,
    title: "Welcome to NIMDA",
    background: "linear-gradient(135deg, #0f3443 0%, #34e89e 100%)",
  },
];

const Banner: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? bannerSlides.length - 1 : prev - 1));
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="home-banner">
      <button
        className="home-banner__btn home-banner__btn--prev"
        onClick={prevSlide}
        aria-label="이전 배너"
      >
        <ChevronLeft size={32} />
      </button>

      {bannerSlides.map((slide, index) => (
        <div
          key={slide.id}
          className={`home-banner__slide ${
            index === currentSlide ? "home-banner__slide--active" : ""
          }`}
          style={{ background: slide.background }}
        >
          <h2 className="home-banner__title">{slide.title}</h2>
        </div>
      ))}

      <button
        className="home-banner__btn home-banner__btn--next"
        onClick={nextSlide}
        aria-label="다음 배너"
      >
        <ChevronRight size={32} />
      </button>

      <div className="home-banner__dots">
        {bannerSlides.map((slide, index) => (
          <button
            key={slide.id}
            className={`home-banner__dot ${
              index === currentSlide ? "home-banner__dot--active" : ""
            }`}
            onClick={() => setCurrentSlide(index)}
            aria-label={`슬라이드 ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Banner;
