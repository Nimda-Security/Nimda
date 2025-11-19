import BlackLineButton from '@/components/Button/BlackLine';
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
  onSolve: (id: number, title: string) => void;
}

export default function ProblemItem({ problem, onSolve }: Props) {
  return (
    <div className="bg-white border border-gray-300 p-6 hover:shadow-md transition-shadow flex items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-lg font-semibold text-black">
            {problem.id}. {problem.title}
          </h2>
          <DifficultyBadge difficulty={problem.difficulty} />
          <span className="text-sm text-gray-600">{problem.points}점</span>
        </div>
        <p className="text-gray-700 text-sm mb-4 line-clamp-2">
          {problem.description}
        </p>
      </div>

      <div className="ml-6 shrink-0">
        <BlackLineButton onClick={() => onSolve(problem.id, problem.title)}>
          문제 풀기
        </BlackLineButton>
      </div>
    </div>
  );
}
