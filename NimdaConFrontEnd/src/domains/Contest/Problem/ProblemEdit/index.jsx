import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { updateProblemAPI, getProblemByIdForAdminAPI } from '@/api/problem';

function ProblemEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    points: "",
    timeLimit: "",
    memoryLimit: "",
    difficulty: "EASY",
    language: "",
    inputFormat: "",
    outputFormat: ""
  });

  const [testCases, setTestCases] = useState([
    { input: "", output: "", isPublic: false }
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadProblem();
  }, [id]);

  const loadProblem = async () => {
    setLoading(true);
    setError(null);
    try {
      // 관리자용 API로 모든 테스트케이스 가져오기
      const result = await getProblemByIdForAdminAPI(id);
      
      if (!result.success || !result.problem) {
        throw new Error('유효한 문제 데이터를 받지 못했습니다.');
      }

      const problem = result.problem;
      
      // 폼 데이터 설정
      setFormData({
        title: problem.title || "",
        description: problem.description || "",
        points: problem.points?.toString() || "",
        timeLimit: problem.timeLimit?.toString() || "",
        memoryLimit: problem.memoryLimit?.toString() || "",
        difficulty: problem.difficulty || "EASY",
        language: problem.language || "",
        inputFormat: problem.inputFormat || "",
        outputFormat: problem.outputFormat || ""
      });

      // 모든 테스트케이스 로드 (공개 + 비공개)
      const allTestCases = result.testCases || [];
      if (allTestCases.length > 0) {
        setTestCases(allTestCases.map(tc => ({
          input: tc.input || "",
          output: tc.output || "",
          isPublic: tc.isPublic || false
        })));
      } else {
        setTestCases([{ input: "", output: "", isPublic: false }]);
      }
    } catch (error) {
      console.error('문제 로드 오류:', error);
      setError('문제를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

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
        isPublic: tc.isPublic || false
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
      language: formData.language || null,
      inputFormat: formData.inputFormat || null,
      outputFormat: formData.outputFormat || null,
      testCases: validTestCases
    };

    try {
      const result = await updateProblemAPI(id, problemData);
      
      if (result.success) {
        alert("문제가 성공적으로 수정되었습니다!");
        navigate(`/problem/${id}`);
      } else {
        alert(`오류: ${result.message}`);
      }
    } catch (error) {
      console.error('문제 수정 오류:', error);
      alert('문제 수정 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-lg text-gray-600">문제를 불러오는 중...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="text-red-600 text-lg mb-4">{error}</div>
          <button
            onClick={() => navigate('/admin')}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">문제 수정</h1>
        <button
          onClick={() => navigate(`/problem/${id}`)}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          취소
        </button>
      </div>
      
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

        {/* 입력 형식 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            입력 형식
          </label>
          <textarea
            name="inputFormat"
            placeholder="입력 형식을 입력하세요"
            value={formData.inputFormat}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-4 py-2 border border-gray-200 rounded-md outline-none resize-none"
          />
        </div>

        {/* 출력 형식 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            출력 형식
          </label>
          <textarea
            name="outputFormat"
            placeholder="출력 형식을 입력하세요"
            value={formData.outputFormat}
            onChange={handleInputChange}
            rows={4}
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

          {/* 언어 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              언어
            </label>
            <input
              name="language"
              type="text"
              placeholder="Java, C++17 등"
              value={formData.language}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-md outline-none"
            />
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
        <div className="flex justify-center gap-4 pt-6">
          <button
            type="button"
            onClick={() => navigate(`/problem/${id}`)}
            className="px-8 py-3 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
          >
            {isSubmitting ? '수정 중...' : '문제 수정하기'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProblemEditPage;

