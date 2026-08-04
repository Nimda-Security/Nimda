// 03 코드 제출 (피그마 프레임 03)
// 구 버전은 location.state로 문제 정보를 받았지만, 새 버전은 /contest/submit/:id
// 라우트 파라미터로 받아 새로고침/직접 진입에도 안전하다.

import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import Layout from '@/components/Layout';
import PageHead from '../../components/PageHead';
import { getProblemDetailAPI } from '@/api/problem';
import { submitSolutionAPI } from '@/api/submission';
import { simulateJudgement } from '@/api/judgeSimulator';
import { LANGUAGES } from '../../contest.config';
import type { ContestLanguage } from '../../contest.config';
import '../../Contest.css';

const findLanguage = (value: string) =>
  LANGUAGES.find((lang) => lang.value === value) ?? LANGUAGES[1]; // 기본 C++17

const ProblemSubmitPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [problemTitle, setProblemTitle] = useState('');
  const [language, setLanguage] = useState<ContestLanguage>('C++17');
  const [sourceCode, setSourceCode] = useState<string>(findLanguage('C++17').template);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getProblemDetailAPI(id).then((result) => {
      if (result.success) setProblemTitle(result.data.title);
      else setError(result.message);
    });
  }, [id]);

  const handleLanguageChange = (next: ContestLanguage) => {
    const prevTemplate = findLanguage(language).template;
    const nextTemplate = findLanguage(next).template;
    setLanguage(next);
    // 코드를 건드리지 않았다면 새 언어 템플릿으로 교체
    if (!sourceCode.trim() || sourceCode === prevTemplate) {
      setSourceCode(nextTemplate);
    }
  };

  const handleReset = () => {
    if (
      sourceCode === findLanguage(language).template ||
      confirm('작성 중인 코드를 지우고 기본 템플릿으로 되돌릴까요?')
    ) {
      setSourceCode(findLanguage(language).template);
    }
  };

  const handleSubmit = async () => {
    if (!id) return;
    if (!sourceCode.trim()) {
      alert('소스코드를 입력해주세요.');
      return;
    }

    setSubmitting(true);
    // language는 백엔드 SupportedLanguage가 받는 표시값을 그대로 전송
    const result = await submitSolutionAPI({
      problemId: Number(id),
      language,
      sourceCode,
    });
    setSubmitting(false);

    if (result.success) {
      simulateJudgement(result.data.submissionId); // MOCK: 채점 워커 미구현 대응
      navigate(`/contest/status?tab=my&problem=${id}`);
    } else {
      alert(result.message);
    }
  };

  return (
    <Layout>
      <div className="contest-page">
        <PageHead
          crumb="대회 · NIMDACON 2026 · 코드 제출"
          title={problemTitle ? `${problemTitle}` : `문제 ${id ?? ''}`}
          actions={
            <Link to={`/contest/problems/${id}`} className="contest-btn contest-btn--secondary">
              문제로 돌아가기
            </Link>
          }
        />

        {error && <p style={{ color: '#d64454', margin: 0 }}>{error}</p>}

        {/* 언어 선택 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="contest-meta__label">언어</span>
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value as ContestLanguage)}
            style={{
              width: 180,
              padding: '8px 12px',
              fontSize: 14,
              border: '1px solid #bcbcbc',
              borderRadius: 4,
              background: '#ffffff',
              color: '#0c0c0c',
            }}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        {/* 코드 에디터 */}
        <div style={{ border: '1px solid #bcbcbc', borderRadius: 4, overflow: 'hidden' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 16px',
              background: '#ececec',
              borderBottom: '1px solid #d4d4d4',
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 500, color: '#525252' }}>소스코드</span>
            <span className="contest-mono" style={{ fontSize: 12, color: '#8b8b8b' }}>
              {findLanguage(language).label}
            </span>
          </div>
          <div style={{ height: 460 }}>
            <Editor
              height="100%"
              language={findLanguage(language).monaco}
              theme="vs-light"
              value={sourceCode}
              onChange={(value) => setSourceCode(value ?? '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: 'on',
                automaticLayout: true,
                scrollBeyondLastLine: false,
                lineNumbersMinChars: 3,
                padding: { top: 16, bottom: 16 },
              }}
            />
          </div>
        </div>

        {/* 액션 바 */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span style={{ fontSize: 12, color: '#8b8b8b' }}>
            제출 후에는 코드를 수정할 수 없습니다. 제출 횟수는 문제당 10회로 제한됩니다.
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="contest-btn contest-btn--secondary" onClick={handleReset}>
              초기화
            </button>
            <button
              type="button"
              className="contest-btn contest-btn--primary"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? '제출 중...' : '제출'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProblemSubmitPage;
