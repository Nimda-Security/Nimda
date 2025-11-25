import React from 'react';
import { useNavigate } from 'react-router-dom';

function ProblemHeader({ problem, from, onEdit, onBack, onSubmit }) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-between mb-8">
      <h1 className="text-3xl font-bold text-black">
        [{problem.id}] {problem.title}
      </h1>

      <div className="flex gap-2">
        {from === 'admin' ? (
          <>
            <button
              onClick={onEdit}
              className="px-4 py-1.5 bg-black text-white text-md rounded hover:bg-blue transition-colors"
            >
              수정
            </button>
            <button
              onClick={onBack}
              className="px-4 py-1.5 bg-white border border-gray-300 text-black text-md rounded hover:bg-gray-100 transition-colors"
            >
              뒤로가기
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onSubmit}
              className="px-4 py-1.5 bg-black text-white text-md rounded hover:bg-blue transition-colors"
            >
              제출
            </button>
            <button
              onClick={() =>
                navigate('/judging-status', {
                  state: {
                    problemId: problem.id,
                    problemTitle: problem.title,
                  },
                })
              }
              className="px-4 py-1.5 bg-black text-white text-md rounded hover:bg-blue transition-colors"
            >
              채점 현황
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default ProblemHeader;
