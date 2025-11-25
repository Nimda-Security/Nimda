import React, { useState } from 'react';
import { createProblemAPI } from '@/api/problem';

function ProblemCreatePage() {

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    points: "",
    timeLimit: "",
    memoryLimit: "",
    difficulty: "EASY"
  });

  const [testCases, setTestCases] = useState([
    { input: "", output: "", isPublic: false }
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTestCaseChange = (index, field, value) => {
    const newTestCases = [...testCases];
    newTestCases[index][field] = value;
    setTestCases(newTestCases);
  };

  const addTestCase = () => {
    setTestCases([...testCases, { input: "", output: "", isPublic: false }]);
  };

  const removeTestCase = (index) => {
    if (testCases.length > 1) {
      const newTestCases = testCases.filter((_, i) => i !== index);
      setTestCases(newTestCases);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 폼 데이터 검증
    if (!formData.title || !formData.description || !formData.points || 
        !formData.timeLimit || !formData.memoryLimit) {
      alert("모든 필수 항목을 입력해주세요.");
      setIsSubmitting(false);
      return;
    }

    // 테스트 케이스 검증
    const validTestCases = testCases
      .filter(tc => tc.input.trim() && tc.output.trim())
      .map(tc => ({
        input: tc.input.trim(),
        output: tc.output.trim(),
        isPublic: tc.isPublic || false // isPublic 필드 보장
      }));
    if (validTestCases.length === 0) {
      alert("최소 하나의 테스트 케이스를 입력해주세요.");
      setIsSubmitting(false);
      return;
    }

    // API 호출 데이터 준비
    const problemData = {
      title: formData.title,
      description: formData.description,
      points: parseInt(formData.points),
      timeLimit: parseInt(formData.timeLimit),
      memoryLimit: parseInt(formData.memoryLimit),
      difficulty: formData.difficulty,
      testCases: validTestCases
    };

    try {
      const result = await createProblemAPI(problemData); // problem.js api 호출부분
      
      if (result.success) {
        alert("문제가 성공적으로 출제되었습니다!");
        // 폼 초기화
        setFormData({
          title: "",
          description: "",
          points: "",
          timeLimit: "",
          memoryLimit: "",
          difficulty: "EASY"
        });
        setTestCases([{ input: "", output: "", isPublic: false }]);
      } else {
        alert(`오류: ${result.message}`);
      }
    } catch (error) {
      console.error('문제 출제 오류:', error);
      alert('문제 출제 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">[테스트페이지] 문제 출제</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 문제 제목 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            문제 제목 *
          </label>
          <input
            name="title"
            type="text"
            placeholder="문제 제목을 입력하세요"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-200 rounded-md outline-none"
            required
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
            required
          />
        </div>

        {/* 문제 설정 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 점수 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              점수 *
            </label>
            <input
              name="points"
              type="number"
              placeholder="100"
              value={formData.points}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-md outline-none"
              required
            />
          </div>

          {/* 시간 제한 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              시간 제한 (ms) *
            </label>
            <input
              name="timeLimit"
              type="number"
              placeholder="5000"
              value={formData.timeLimit}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-md outline-none"
              required
            />
          </div>

          {/* 메모리 제한 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              메모리 제한 (KB) *
            </label>
            <input
              name="memoryLimit"
              type="number"
              placeholder="262144"
              value={formData.memoryLimit}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-md outline-none"
              required
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
            {testCases.map((testCase, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    입력 예시 {index + 1}
                  </label>
                  <textarea
                    placeholder="테스트 케이스 입력"
                    value={testCase.input}
                    onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    출력 예시 {index + 1}
                  </label>
                  <textarea
                    placeholder="테스트 케이스 출력"
                    value={testCase.output}
                    onChange={(e) => handleTestCaseChange(index, 'output', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md outline-none resize-none"
                  />
                </div>
                <div className="col-span-2 flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={testCase.isPublic || false}
                      onChange={(e) => handleTestCaseChange(index, 'isPublic', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">공개 테스트케이스 (프론트엔드에 표시)</span>
                  </label>
                  {testCases.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTestCase(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      삭제
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addTestCase}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              + 테스트 케이스 추가
            </button>
          </div>
        </div>

        {/* 제출 버튼 */}
        <div className="flex justify-center pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
          >
            {isSubmitting ? '출제 중...' : '문제 출제하기'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProblemCreatePage;
