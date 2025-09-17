import NavBar from "@/components/Layout/Header/NavBar";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function ProblemSubmitPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    difficulty: "",
    category: "",
    points: "",
    description: "",
    flag: "",
    hints: "",
  });

  const goToHome = () => {
    navigate("/");
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 폼 데이터 검증
    if (!formData.title || !formData.difficulty || !formData.category || !formData.points || !formData.description || !formData.flag) {
      alert("필수 항목을 모두 입력해주세요.");
      return;
    }

    // 임시로 콘솔에 출력 (나중에 API 호출로 변경)
    console.log("제출된 문제 데이터:", formData);
    
    alert(`🎉 문제가 성공적으로 제출되었습니다!

제목: ${formData.title}
난이도: ${formData.difficulty}
카테고리: ${formData.category}
점수: ${formData.points}점`);
    
    // 폼 초기화
    setFormData({
      title: "",
      difficulty: "",
      category: "",
      points: "",
      description: "",
      flag: "",
      hints: "",
    });
  };

  return (
    <>
      <NavBar />
      <div 
        className="min-h-screen bg-gray-50"
        style={{ paddingTop: '64px' }}
      >
        {/* 헤더 바 */}
        <div className="bg-white border-b border-gray-300 px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-black">[문제 1] 진짜 둘기를 찾아봐</h1>
          <button 
            onClick={handleSubmit}
            className="bg-black text-white px-3 py-1.5 text-sm rounded hover:bg-gray-800 transition-colors"
          >
            제출
          </button>
        </div>

        <div className="flex h-[calc(100vh-128px)]">
          {/* 왼쪽 사이드바 */}
          <div className="w-48 bg-white border-r border-gray-300 p-3 flex flex-col gap-3">
            <div>
              <label className="block text-sm font-medium text-black mb-1">언어</label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:border-blue-500"
                style={{ fontSize: '13px' }}
              >
                <option value="">Java</option>
                <option value="C99">C99</option>
                <option value="C++17">C++17</option>
                <option value="Java" selected>Java</option>
                <option value="Python">Python</option>
              </select>
            </div>
            
          </div>

          {/* 메인 콘텐츠 영역 */}
          <div className="flex-1 flex flex-col">
            {/* 문제 내용 영역 */}
            <div className="flex-1 bg-white border-l border-gray-300">
              <div className="border-b border-gray-300 px-4 py-2 bg-gray-50">
                <span className="text-sm font-medium text-black">문제</span>
              </div>
              <div className="flex-1 p-4" style={{ minHeight: '400px' }}>
                <textarea
                  placeholder=""
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full h-full resize-none border-none outline-none text-sm leading-relaxed text-black bg-transparent"
                  required
                  style={{ 
                    fontFamily: 'monospace, Consolas, "Courier New"',
                    lineHeight: '1.5',
                    fontSize: '13px',
                    minHeight: '350px'
                  }}
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default ProblemSubmitPage;
