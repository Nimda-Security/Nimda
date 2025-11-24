import Layout from '@/components/Layout';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Editor from '@monaco-editor/react';

function ProblemSubmitPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // URL 파라미터에서 문제 정보 가져오기
  const problemId = location.state?.problemId || 1; // 기본값 1 (A + B)
  const problemTitle = location.state?.problemTitle || 'A + B';
  const [formData, setFormData] = useState({
    title: '',
    difficulty: '',
    category: 'C++17', // C++을 기본값으로 설정
    points: '',
    description: '',
    flag: '',
    hints: '',
  });

  // 언어 명칭 정규화 함수
  const normalizeLanguage = (lang: string) => {
    const lowerLang = lang.toLowerCase();
    if (lowerLang.includes('c++') || lowerLang === 'cpp') return 'C++17';
    if (lowerLang === 'c' || lowerLang === 'c99') return 'C99';
    if (lowerLang === 'java') return 'Java';
    return 'C++17'; // 기본값
  };

  // 컴포넌트 마운트 시 초기값 설정
  useEffect(() => {
    const initialCode = location.state?.code;
    const initialLanguage = location.state?.language;

    if (initialCode && initialLanguage) {
      setFormData((prev) => ({
        ...prev,
        description: initialCode,
        category: normalizeLanguage(initialLanguage),
      }));
    } else if (!formData.description.trim()) {
      const template = getLanguageTemplate('C++17');
      setFormData((prev) => ({
        ...prev,
        description: template,
      }));
    }
  }, []);

  // 언어를 Monaco Editor 언어 ID로 변환
  const getMonacoLanguage = (language: string) => {
    switch (language) {
      case 'C++17':
      case 'cpp':
        return 'cpp';
      case 'Java':
        return 'java';
      case 'C99':
        return 'c';
      default:
        return 'plaintext';
    }
  };

  // 언어별 기본 템플릿
  const getLanguageTemplate = (language: string) => {
    switch (language) {
      case 'C++17':
      case 'cpp':
        return `#include <iostream>
using namespace std;

int main() {
    // 여기에 코드를 작성하세요
    
    return 0;
}`;
      case 'Java':
        return `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // 여기에 코드를 작성하세요
        
    }
}`;
      case 'C99':
        return `#include <stdio.h>

int main() {
    // 여기에 코드를 작성하세요
    
    return 0;
}`;
      default:
        return '';
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'category') {
      setFormData((prev) => {
        const prevTemplate = getLanguageTemplate(prev.category);
        const nextTemplate = getLanguageTemplate(value);
        const shouldReplace =
          !prev.description.trim() || prev.description === prevTemplate;

        return {
          ...prev,
          category: value,
          description:
            shouldReplace && nextTemplate ? nextTemplate : prev.description,
        };
      });
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 기본 검증
    if (!formData.description || !formData.category) {
      alert('소스코드와 언어를 선택해주세요.');
      return;
    }

    // 제출 데이터 준비
    const submissionData = {
      title: problemTitle, // 선택된 문제 제목 사용
      code: formData.description, // 소스코드 영역의 내용
      language: formData.category,
      problemId: problemId, // 문제 ID 추가
      description: '문제를 해결하는 프로그램을 작성하시오.',
      points: parseInt(formData.points) || 100,
      nonce: Date.now().toString() + Math.random().toString(36).substr(2, 9), // 중복 제출 방지용 고유 ID
    };

    // 채점 상태 페이지로 이동 (제출 데이터와 함께)
    navigate('/judging-status', {
      state: {
        submissionData,
        isNewSubmission: true, // 새로운 제출임을 표시
      },
    });
  };

  return (
    <Layout>
      <div className="min-h-screen pt-8">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          {/* 헤더 바 */}
          <div className="bg-white border border-gray-300 rounded-t-lg px-6 py-4 flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-black">
              [문제 {problemId}] {problemTitle}
            </h1>
            <button
              onClick={handleSubmit}
              className="bg-black text-white px-4 py-2 text-sm font-medium rounded hover:bg-blue transition-colors"
            >
              제출
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* 왼쪽 사이드바 */}
            <div className="w-full md:w-64 bg-white border border-gray-300 rounded-lg p-6 h-fit">
              <div>
                <label className="block text-sm font-bold text-black mb-2">
                  언어
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    handleInputChange('category', e.target.value)
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                >
                  <option value="C++17">C++17</option>
                  <option value="C99">C99</option>
                  <option value="Java">Java</option>
                </select>
              </div>
            </div>

            {/* 메인 콘텐츠 영역 */}
            <div className="flex-1 flex flex-col">
              {/* 문제 내용 영역 */}
              <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
                <div className="border-b border-gray-300 px-6 py-3 bg-gray-50">
                  <span className="text-sm font-bold text-black">소스코드</span>
                </div>
                {/* 소스코드 입력 영역  */}
                <div className="h-[600px]">
                  <Editor
                    height="100%"
                    language={getMonacoLanguage(formData.category)}
                    theme="vs-light"
                    value={formData.description}
                    onChange={(value) =>
                      handleInputChange('description', value || '')
                    }
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      wordWrap: 'on',
                      automaticLayout: true,
                      scrollBeyondLastLine: false,
                      lineNumbers: 'on',
                      folding: false,
                      glyphMargin: false,
                      lineDecorationsWidth: 0,
                      lineNumbersMinChars: 3,
                      renderLineHighlight: 'line',
                      contextmenu: true,
                      selectOnLineNumbers: true,
                      roundedSelection: false,
                      readOnly: false,
                      cursorStyle: 'line',
                      smoothScrolling: true,
                      padding: { top: 16, bottom: 16 },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default ProblemSubmitPage;
