import React from 'react';
import ArrowLeftIcon from '@/components/icons/Write';
import ArrowRightIcon from '@/components/icons/Logout';

const UserActions: React.FC = () => {
  return (
    <div className="flex items-center space-x-4">
      <div className="text-[#1A1A1A] text-right font-pretendard text-base font-semibold leading-[150%] overflow-hidden text-ellipsis mr-5">
        admin
      </div>
      <ArrowLeftIcon className="mr-[10px]" />
      <ArrowRightIcon className="mr-[332px]" />
    </div>
  );
};

export default UserActions;
