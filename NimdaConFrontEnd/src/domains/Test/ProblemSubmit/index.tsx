import NavBar from "@/components/Layout/Header/NavBar";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Editor from '@monaco-editor/react';

function ProblemSubmitPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    difficulty: "",
    category: "C++17", // C++을 기본값으로 설정
    points: "",
    description: "",
    flag: "",
    hints: "",
  });

  const goToHome = () => {
    navigate("/");
  };

  // 컴포넌트 마운트 시 C++ 템플릿 설정
  useEffect(() => {
    if (!formData.description.trim()) {
      const template = getLanguageTemplate('C++17');
      setFormData(prev => ({
        ...prev,
        description: template
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
      case 'Python':
        return 'python';
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
      case 'Python':
        return `# 여기에 코드를 작성하세요

`;
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
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // 언어가 변경되고 소스코드가 비어있으면 템플릿 적용
    if (field === 'category' && !formData.description.trim()) {
      const template = getLanguageTemplate(value);
      if (template) {
        setFormData(prev => ({
          ...prev,
          description: template
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 기본 검증
    if (!formData.description || !formData.category) {
      alert("소스코드와 언어를 선택해주세요.");
      return;
    }

    // 제출 데이터 준비
    const submissionData = {
      title: formData.title || "A + B",
      code: formData.description, // 소스코드 영역의 내용
      language: formData.category,
      description: "두 정수 A와 B를 입력받아 A+B를 출력하는 프로그램을 작성하시오.",
      flag: formData.flag,
      hints: formData.hints,
      points: parseInt(formData.points) || 100
    };

    // 채점 상태 페이지로 이동 (제출 데이터와 함께)
    navigate('/judging-status', { 
      state: { submissionData } 
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
          <h1 className="text-lg font-semibold text-black">[문제 1] A + B </h1>
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
                <option value="C++17">C++17</option>
                <option value="C99">C99</option>
                <option value="Java">Java</option>
                <option value="Python">Python</option>

              </select>
            </div>
            
          </div>

          {/* 메인 콘텐츠 영역 */}
          <div className="flex-1 flex flex-col">
            {/* 문제 내용 영역 */}
            <div className="flex-1 bg-white border-l border-gray-300">
              <div className="border-b border-gray-300 px-4 py-2 bg-gray-50">
                <span className="text-sm font-medium text-black">소스코드</span>
              </div>
              {/* 소스코드 입력 영역  */}
              <div className="flex-1" style={{ minHeight: '400px' }}>
                <Editor
                  height="400px"
                  language={getMonacoLanguage(formData.category)}
                  theme="vs-light"
                  value={formData.description}
                  onChange={(value) => handleInputChange('description', value || '')}
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
                    padding: { top: 10, bottom: 10 }
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
