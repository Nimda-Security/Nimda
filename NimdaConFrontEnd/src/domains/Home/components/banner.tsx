import React from "react";

const Banner: React.FC = () => {
  return (
    <div className="home-banner">
      <div className="home-banner__slide home-banner__slide--active home-banner__slide--img">
        <img src="/nimda_con_1.png" alt="NIMDA CON" className="home-banner__img" />
      </div>
    </div>
  );
};

export default Banner;
