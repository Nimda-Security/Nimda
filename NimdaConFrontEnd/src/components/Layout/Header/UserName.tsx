import React from "react";
import ArrowLeftIcon from "@/components/icons/Write";
import ArrowRightIcon from "@/components/icons/Logout";

const UserActions: React.FC = () => {
  return (
    <div className="flex items-center space-x-4 xl:space-x-6">
      <div className="text-[#1A1A1A] text-right font-pretendard text-base xl:text-lg font-semibold leading-relaxed overflow-hidden text-ellipsis">
        admin
      </div>
      <ArrowLeftIcon className="w-5 h-5 xl:w-6 xl:h-6" />
      <ArrowRightIcon className="w-5 h-5 xl:w-6 xl:h-6" />
    </div>
  );
};

export default UserActions;
