// 02 문제 상세 (피그마 프레임 02)

import { Link, useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import PageHead from '../../components/PageHead';
import MetaStrip from '../../components/MetaStrip';
import { useProblemDetail } from './useProblemDetail';
import '../../Contest.css';

const ProblemDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { problem, html, loading, error } = useProblemDetail(id);

  if (loading) {
    return (
      <Layout>
        <div className="contest-page">
          <p style={{ color: '#8b8b8b', padding: '48px 0' }}>문제를 불러오는 중...</p>
        </div>
      </Layout>
    );
  }

  if (error || !problem) {
    return (
      <Layout>
        <div className="contest-page">
          <p style={{ color: '#d64454', padding: '48px 0' }}>
            {error ?? '문제를 불러올 수 없습니다.'}
          </p>
          <Link to="/contest/problems" className="contest-btn contest-btn--secondary" style={{ alignSelf: 'flex-start' }}>
            문제 목록으로
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="contest-page">
        <PageHead
          crumb="대회 · NIMDACON 2026"
          title={problem.title}
          actions={
            <>
              <Link
                to={`/contest/status?tab=my&problem=${id}`}
                className="contest-btn contest-btn--secondary"
              >
                채점 현황
              </Link>
              <Link to={`/contest/submit/${id}`} className="contest-btn contest-btn--primary">
                제출
              </Link>
            </>
          }
        />

        <MetaStrip
          items={[
            { label: '시간 제한', value: `${problem.timeLimit} 초` },
            // TODO(backend bug): memoryLimit에 timeLimit 값이 들어옴 — 백엔드 수정 시 자동 정상화
            { label: '메모리 제한', value: `${problem.memoryLimit} MB` },
            { label: '배점', value: `${problem.points} 점` },
            { label: '제출', value: '—' },
            { label: '정답 비율', value: '—' },
          ]}
        />

        {html ? (
          // 지문은 S3에 저장된 원문 HTML — sanitize 후 렌더, 스타일은 하위 선택자로 부여
          <div className="contest-problem-html" dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <div className="contest-problem-html">
            <h2>문제</h2>
            <p style={{ whiteSpace: 'pre-line' }}>{problem.description}</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProblemDetailPage;
