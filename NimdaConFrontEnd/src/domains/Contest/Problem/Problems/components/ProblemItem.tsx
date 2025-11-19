import DifficultyBadge from './DifficultyBadge';

export interface Problem {
  id: number;
  title: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  points: number;
  description: string;
}

interface Props {
  problem: Problem;
  onSolve: (id: number) => void;
}

export default function ProblemItem({ problem, onSolve }: Props) {
  const handleClick = () => {
    onSolve(problem.id);
  };

  return (
    <div 
      className="bg-white border border-gray-300 p-6 hover:shadow-md transition-shadow flex items-center justify-between cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-black">
            {problem.id}. {problem.title}
          </h2>
          <DifficultyBadge difficulty={problem.difficulty} />
          <span className="text-sm text-gray-600">{problem.points}점</span>
        </div>
      </div>

      {/* 바로가기 버튼 */}
      <div className="ml-6 shrink-0">
        <BlackLineButton onClick={(e) => {
          e.stopPropagation(); // 카드 클릭 이벤트와 중복 방지
          onSolve(problem.id, problem.title);
        }}>
          문제 풀기
        </BlackLineButton>
      </div>
    </div>
  );
}
