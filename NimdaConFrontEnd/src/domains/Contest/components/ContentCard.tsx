interface ContentCardProps {
  title: string;
  content: string;
  className?: string; // 추가적인 스타일링을 위해
}

const ContentCard = ({ title, content, className = '' }: ContentCardProps) => {
  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-8 ${className}`}>
      {/* 카드 제목 */}
      <h3 className="text-xl font-bold text-black mb-6">
        {title}
      </h3>
      
      {/* 내용 (줄바꿈 유지) */}
      <div className="whitespace-pre-wrap text-gray-800 leading-relaxed text-base font-medium">
        {content}
      </div>
    </div>
  );
};

export default ContentCard;