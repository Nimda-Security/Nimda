import React, { useState } from "react";

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

  return (
    <div className="home-banner">
      <div
        className="home-banner__slide"
        style={{ background: bannerSlides[currentSlide].background }}
      >
        <h2 className="home-banner__title">
          {bannerSlides[currentSlide].title}
        </h2>
      </div>
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
