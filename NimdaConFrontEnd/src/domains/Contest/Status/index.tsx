// 04 채점 현황 / 랭킹 (피그마 프레임 04)
// 탭: 전체 순위(목업) / 내 제출(실제 API) / 문제별 통계(목업) — ?tab= 에 동기화

import { Link, useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import PageHead from '../components/PageHead';
import LeaderboardTable from './LeaderboardTable';
import MySubmissions from './MySubmissions';
import ProblemStats from './ProblemStats';
import '../Contest.css';

type TabKey = 'rank' | 'my' | 'stats';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'rank', label: '전체 순위' },
  { key: 'my', label: '내 제출' },
  { key: 'stats', label: '문제별 통계' },
];

const StatusPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab');
  const tab: TabKey = rawTab === 'my' || rawTab === 'stats' ? rawTab : 'rank';

  const switchTab = (next: TabKey) => {
    setSearchParams((prev) => {
      prev.set('tab', next);
      if (next !== 'my') prev.delete('problem');
      return prev;
    });
  };

  return (
    <Layout>
      <div className="contest-page">
        <PageHead
          crumb="대회 · NIMDACON 2026"
          title="채점 현황"
          description="내 제출 결과와 전체 순위를 확인합니다."
          actions={
            <Link to="/contest/problems" className="contest-btn contest-btn--secondary">
              문제 목록
            </Link>
          }
        />

        <div className="contest-tabs">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              className={`contest-tab${tab === key ? ' contest-tab--active' : ''}`}
              onClick={() => switchTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'rank' && <LeaderboardTable />}
        {tab === 'my' && <MySubmissions />}
        {tab === 'stats' && <ProblemStats />}
      </div>
    </Layout>
  );
};

export default StatusPage;
