import "@/App.css";
import BlackButton from "@/components/Button/Black";
import Layout from "@/components/Layout";
import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Input } from "@/components/Input";

function ProblemCreatePage() {
  // const navigate = useNavigate();

  const [problemData, setProblemData] = useState({
    title: "",
    description: "",
    points: 0,
    timeLimit: 0,
    memoryLimit: 0,
    difficulty: "EASY",
    testCases: [{ input: "", output: "" }]
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProblemData(prev => ({ ...prev, [name]: value }));
  };

  const handleTestCaseChange = (index: number, field: "input" | "output", value: string) => {
    const newTestCases = problemData.testCases.map((tc, i) => 
      i === index ? { ...tc, [field]: value } : tc
    );
    setProblemData(prev => ({ ...prev, testCases: newTestCases }));
  };

  const addTestCase = () => {
    setProblemData(prev => ({
      ...prev,
      testCases: [...prev.testCases, { input: "", output: "" }]
    }));
  };

  const removeTestCase = (index: number) => {
    setProblemData(prev => ({
      ...prev,
      testCases: prev.testCases.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("문제 출제 데이터:", problemData);
    // TODO: 문제 출제 API 호출
    alert("문제 출제 기능은 아직 구현되지 않았습니다.");
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center pt-14">
        <h1 className="text-3xl font-bold mb-12">NIMDA CON</h1>
        <div className="text-xl font-bold mb-4">[테스트페이지] 문제 출제</div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-2xl">
          {/* 문제 제목 */}
          <input
            name="title"
            type="text"
            placeholder="문제 제목"
            value={problemData.title}
            onChange={handleInputChange}
            className="px-4 py-2 border-1 border-gray-200 bg-white rounded-md outline-none"
          />

          {/* 문제 설명 */}
          <textarea
            name="description"
            placeholder="문제 설명"
            value={problemData.description}
            onChange={handleInputChange}
            rows={5}
            className="px-4 py-2 border-1 border-gray-200 bg-white rounded-md outline-none"
          ></textarea>

          {/* 점수, 시간 제한, 메모리 제한 */}
          <div className="grid grid-cols-3 gap-4">
            <input
              name="points"
              type="number"
              placeholder="점수"
              value={problemData.points.toString()}
              onChange={handleInputChange}
              className="px-4 py-2 border-1 border-gray-200 bg-white rounded-md outline-none"
            />
            <input
              name="timeLimit"
              type="number"
              placeholder="시간 제한 (ms)"
              value={problemData.timeLimit.toString()}
              onChange={handleInputChange}
              className="px-4 py-2 border-1 border-gray-200 bg-white rounded-md outline-none"
            />
            <input
              name="memoryLimit"
              type="number"
              placeholder="메모리 제한 (KB)"
              value={problemData.memoryLimit.toString()}
              onChange={handleInputChange}
              className="px-4 py-2 border-1 border-gray-200 bg-white rounded-md outline-none"
            />
          </div>

          {/* 난이도 */}
          <select
            name="difficulty"
            value={problemData.difficulty}
            onChange={handleInputChange}
            className="px-4 py-2 border-1 border-gray-200 bg-white rounded-md outline-none"
          >
            <option value="EASY">쉬움</option>
            <option value="MEDIUM">보통</option>
            <option value="HARD">어려움</option>
          </select>

          {/* 테스트 케이스 */}
          <div className="flex flex-col gap-2 border p-4 rounded-md">
            <h3 className="text-lg font-semibold">테스트 케이스</h3>
            {problemData.testCases.map((testCase, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder={`입력 ${index + 1}`}
                  value={testCase.input}
                  onChange={(e) => handleTestCaseChange(index, "input", e.target.value)}
                  className="flex-1 px-4 py-2 border-1 border-gray-200 bg-white rounded-md outline-none"
                />
                <input
                  type="text"
                  placeholder={`출력 ${index + 1}`}
                  value={testCase.output}
                  onChange={(e) => handleTestCaseChange(index, "output", e.target.value)}
                  className="flex-1 px-4 py-2 border-1 border-gray-200 bg-white rounded-md outline-none"
                />
                <BlackButton type="button" onClick={() => removeTestCase(index)}>
                  삭제
                </BlackButton>
              </div>
            ))}
            <BlackButton type="button" onClick={addTestCase}>
              테스트 케이스 추가
            </BlackButton>
          </div>

          <BlackButton type="submit">
            문제 출제
          </BlackButton>
        </form>
      </div>
    </Layout>
  );
}

export default ProblemCreatePage;
