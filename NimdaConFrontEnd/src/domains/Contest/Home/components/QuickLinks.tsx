import { FileText, CheckCircle, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { isAdmin } from '@/utils/jwt';

export function QuickLinks() {
  const navigate = useNavigate();
  const links = [
    {
      icon: FileText,
      title: '문제 바로가기',
      path: '/problems',
    },
    // {
    //   icon: CheckCircle,
    //   title: '제출 현황',
    //   path: '/status',
    // },
    {
      icon: Trophy,
      title: '스코어보드',
      path: '/scoreboard',
    },
  ];

  const handleLinkClick = (path: string) => {
    const contestStartTime = new Date('2025-11-27T19:30:00');
    const now = new Date();

    if (now < contestStartTime && !isAdmin()) {
      alert('대회 시작 전입니다.');
      return;
    }

    navigate(path);
  };

  return (
    <div className="flex flex-col min-[820px]:flex-row gap-6 justify-center">
      {links.map((link, index) => {
        const Icon = link.icon;

        return (
          <div
            key={index}
            onClick={() => handleLinkClick(link.path)}
            className="group bg-white rounded-2xl p-8 transition-all duration-300 cursor-pointer border border-[#e0e0e0] hover:border-gray-600 w-full min-[820px]:w-[250px] hover:shadow-lg"
          >
            <div className="flex flex-col items-center text-center">
              <Icon
                className="w-20 h-20 mb-4 text-black group-hover:scale-110 transition-transform duration-300"
                strokeWidth={1.5}
              />
              <h3 className="text-black font-['Pretendard:SemiBold',sans-serif]">
                {link.title}
              </h3>
            </div>
          </div>
        );
      })}
    </div>
  );
}
