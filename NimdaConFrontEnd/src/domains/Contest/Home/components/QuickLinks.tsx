import { FileText, CheckCircle, Trophy } from 'lucide-react';

export function QuickLinks() {
  const links = [
    {
      icon: FileText,
      title: '문제 바로가기',
    },
    {
      icon: CheckCircle,
      title: '제출 현황',
    },
    {
      icon: Trophy,
      title: '스코어보드',
    },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-6 justify-center">
      {links.map((link, index) => {
        const Icon = link.icon;

        return (
          <div
            key={index}
            className="group bg-white rounded-2xl p-8 transition-all duration-300 cursor-pointer border border-[#e0e0e0] hover:border-gray-600 w-full md:w-[300px] hover:shadow-lg"
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
