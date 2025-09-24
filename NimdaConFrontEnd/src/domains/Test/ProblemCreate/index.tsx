import "@/App.css";
import BlackButton from "@/components/Button/Black";
import Layout from "@/components/Layout";
import { useState } from "react";
import { Input } from "@/components/Input";

function ProblemCreatePage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    points: "",
    timeLimit: "",
    memoryLimit: "",
    difficulty: "EASY"
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 문제 출제 API 호출
    console.log("문제 출제 데이터:", formData);
    alert("문제가 출제되었습니다! (기능 구현 예정)");
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8 text-center">[테스트페이지] 문제 출제</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 문제 제목 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              문제 제목 *
            </label>
            <Input
              name="title"
              placeholder="문제 제목을 입력하세요"
              value={formData.title}
              onChange={handleInputChange}
            />
          </div>

          {/* 문제 설명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              문제 설명 *
            </label>
            <textarea
              name="description"
              placeholder="문제 설명을 입력하세요"
              value={formData.description}
              onChange={handleInputChange}
              rows={8}
              className="w-full px-4 py-2 border border-gray-200 rounded-md outline-none resize-none"
            />
          </div>

          {/* 문제 설정 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 점수 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                점수 *
              </label>
              <Input
                name="points"
                type="number"
                placeholder="100"
                value={formData.points}
                onChange={handleInputChange}
              />
            </div>

            {/* 시간 제한 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                시간 제한 (ms) *
              </label>
              <Input
                name="timeLimit"
                type="number"
                placeholder="5000"
                value={formData.timeLimit}
                onChange={handleInputChange}
              />
            </div>

            {/* 메모리 제한 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                메모리 제한 (KB) *
              </label>
              <Input
                name="memoryLimit"
                type="number"
                placeholder="262144"
                value={formData.memoryLimit}
                onChange={handleInputChange}
              />
            </div>

            {/* 난이도 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                난이도 *
              </label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-md outline-none"
              >
                <option value="EASY">쉬움</option>
                <option value="MEDIUM">보통</option>
                <option value="HARD">어려움</option>
              </select>
            </div>
          </div>

          {/* 테스트 케이스 섹션 */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">테스트 케이스</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    입력 예시
                  </label>
                  <textarea
                    placeholder="테스트 케이스 입력"
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    출력 예시
                  </label>
                  <textarea
                    placeholder="테스트 케이스 출력"
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md outline-none resize-none"
                  />
                </div>
              </div>
              <button
                type="button"
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                + 테스트 케이스 추가
              </button>
            </div>
          </div>

          {/* 제출 버튼 */}
          <div className="flex justify-center pt-6">
            <BlackButton type="submit" className="px-8 py-3">
              문제 출제하기
            </BlackButton>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default ProblemCreatePage;
