import React from 'react';
import Bannerimage from '/NimdaconBanner.png';

const Banner = () => {
  return (
    <div className="h-[360px] w-[1440px] pt-15">
      <img
        src={Bannerimage}
        alt="Nimdacon Banner"
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default Banner;
