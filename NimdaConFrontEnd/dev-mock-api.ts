// 개발 전용 목업 API 플러그인 — 백엔드/로그인 없이 대회 페이지를 확인하기 위한 용도.
//
// 활성 조건: VITE_MOCK_API=1 npm run dev
// 그 외에는 플러그인이 아무 것도 하지 않으므로 평소 `npm run dev`(→ localhost:8080 프록시)와
// 프로덕션 빌드 동작에는 전혀 영향이 없다.
//
// 대회(NIMDACON) 관련 엔드포인트만 가로채고, 나머지 요청은 기존 프록시로 그대로 흘려보낸다.

import type { Plugin } from 'vite';
import type { IncomingMessage, ServerResponse } from 'node:http';

const enabled = () => process.env.VITE_MOCK_API === '1';

/* ---------------------------- 목업 데이터 ---------------------------- */

const PROBLEMS = [
  { id: 1, code: 'A', title: '진짜 두기를 찾아봐', points: 100, createdAt: '2026-03-21T10:00:00' },
  { id: 2, code: 'B', title: '님다 코인 정산', points: 150, createdAt: '2026-03-21T10:00:00' },
  { id: 3, code: 'C', title: '카르텔 접근 권한', points: 200, createdAt: '2026-03-21T10:00:00' },
  { id: 4, code: 'D', title: '스터디 시간표 짜기', points: 300, createdAt: '2026-03-21T10:00:00' },
  { id: 5, code: 'E', title: '방문자 로그 압축', points: 350, createdAt: '2026-03-21T10:00:00' },
  { id: 6, code: 'F', title: '배지 그래프 순회', points: 500, createdAt: '2026-03-21T10:00:00' },
];

const PROBLEM_HTML = `
<h2>문제</h2>
<p>두기는 NIMDA의 마스코트다. 어느 날 두기를 사칭하는 가짜 두기 N마리가 동아리방에 나타났다.</p>
<p>진짜 두기는 정확히 한 마리이며, 진짜 두기가 보유한 님다 코인의 개수는 다른 모든 두기와 다르다.
가짜 두기들이 보유한 님다 코인의 개수는 모두 같다.</p>
<p>두기들이 보유한 코인의 개수가 주어질 때, 진짜 두기가 몇 번째 두기인지 찾는 프로그램을 작성하시오.</p>
<h2>입력</h2>
<p>첫째 줄에 두기의 수 N이 주어진다. (3 ≤ N ≤ 100,000)<br />
둘째 줄에 N개의 정수 c1, c2, ..., cN이 공백으로 구분되어 주어진다. (1 ≤ ci ≤ 1,000,000)</p>
<h2>출력</h2>
<p>진짜 두기의 번호를 첫째 줄에 출력한다. 번호는 1번부터 시작한다.</p>
<h2>입력 예시 1</h2>
<pre>5
10 10 42 10 10</pre>
<h2>출력 예시 1</h2>
<pre>3</pre>
<h2>입력 예시 2</h2>
<pre>3
7 7 1</pre>
<h2>출력 예시 2</h2>
<pre>3</pre>
`;

const SUBMISSIONS = [
  { submissionId: 104, problemId: 1, language: 'Java', status: 'ACCEPTED', executionTimeMs: 312, usedMemoryKb: 98304, createdAt: '2026-03-21T13:58:41' },
  { submissionId: 103, problemId: 1, language: 'Java', status: 'WRONG_ANSWER', executionTimeMs: 288, usedMemoryKb: 96256, createdAt: '2026-03-21T13:41:02' },
  { submissionId: 102, problemId: 1, language: 'C++17', status: 'TIME_LIMIT_EXCEEDED', executionTimeMs: 2000, usedMemoryKb: 131072, createdAt: '2026-03-21T13:22:15' },
  { submissionId: 101, problemId: 1, language: 'Python', status: 'COMPILE_ERROR', executionTimeMs: null, usedMemoryKb: null, createdAt: '2026-03-21T13:05:47' },
  { submissionId: 100, problemId: 1, language: 'C99', status: 'PENDING', executionTimeMs: null, usedMemoryKb: null, createdAt: '2026-03-21T12:59:03' },
].map((s) => ({ ...s, problemTitle: null, userId: 1, errorMessage: s.status === 'COMPILE_ERROR' ? 'Main.py:3:1: SyntaxError: invalid syntax' : null }));

const CATEGORIES = [
  { id: 1, name: '새 소식', slug: 'news', parentId: null, sortOrder: 1, isActive: true },
  { id: 11, name: '공지사항', slug: 'notice', parentId: 1, sortOrder: 1, isActive: true },
  { id: 12, name: '결산 내역', slug: 'settlement', parentId: 1, sortOrder: 2, isActive: true },
  { id: 2, name: '학술 게시판', slug: 'study-board', parentId: null, sortOrder: 2, isActive: true },
  { id: 21, name: '스터디', slug: 'study', parentId: 2, sortOrder: 1, isActive: true },
  { id: 22, name: '자료실', slug: 'archive', parentId: 2, sortOrder: 2, isActive: true },
  { id: 3, name: '커뮤니티', slug: 'community', parentId: null, sortOrder: 3, isActive: true },
  { id: 31, name: '자유게시판', slug: 'free-board', parentId: 3, sortOrder: 1, isActive: true },
  { id: 32, name: '사진첩', slug: 'picture-board', parentId: 3, sortOrder: 2, isActive: true },
  { id: 4, name: '대회', slug: 'contest-menu', parentId: null, sortOrder: 4, isActive: true },
  { id: 41, name: 'NIMDACON', slug: 'nimdacon', parentId: 4, sortOrder: 1, redirectUrl: '/contest', isActive: true },
  { id: 42, name: '외부 대회', slug: 'external-contest', parentId: 4, sortOrder: 2, isActive: true },
];

/* ---------------------------- 응답 헬퍼 ---------------------------- */

const wrap = (data: unknown) => ({ success: true, message: null, data });

const page = <T,>(content: T[], pageNo = 0, size = 20) => ({
  content,
  totalPages: Math.max(1, Math.ceil(content.length / size)),
  totalElements: content.length,
  number: pageNo,
  size,
  first: pageNo === 0,
  last: true,
});

const json = (res: ServerResponse, body: unknown, status = 200) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
};

/* ---------------------------- 플러그인 ---------------------------- */

export const devMockApi = (): Plugin => ({
  name: 'nimda-dev-mock-api',
  apply: 'serve',

  // 로그인 없이 렌더되도록 localStorage의 표시용 사용자 정보를 심어 준다 (목업 모드 한정)
  transformIndexHtml(html) {
    if (!enabled()) return html;
    return html.replace(
      '</head>',
      `  <script>
      localStorage.setItem('user', JSON.stringify({ nickname: '닉네임', profileImageUrl: null }));
      localStorage.setItem('roles', JSON.stringify(['ROLE_USER']));
    </script>
  </head>`,
    );
  },

  configureServer(server) {
    if (!enabled()) return;
    server.config.logger.warn('\n  [dev-mock-api] 목업 API 활성 — 대회 엔드포인트를 가짜 데이터로 응답합니다.\n');

    // 반환값 없이 등록해야 Vite 내부 proxy 미들웨어보다 먼저 실행된다.
    server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: () => void) => {
      const url = (req.url ?? '').split('?')[0];
      const method = req.method ?? 'GET';

      if (!url.startsWith('/api/')) return next();

      // 세션 검증 — ProtectedRoute 통과용
      if (url === '/api/auth/me') return json(res, wrap({ nickname: '닉네임' }));

      // 사이드바 카테고리
      if (url === '/api/cite/category') return json(res, CATEGORIES);

      // 알림 (콘솔 노이즈 방지)
      if (url.startsWith('/api/notifications')) return json(res, wrap([]));

      // 문제 지문 HTML — raw text/html (유일하게 래핑되지 않는 응답)
      const htmlMatch = url.match(/^\/api\/judge\/problem\/(\d+)\/html$/);
      if (htmlMatch) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.end(PROBLEM_HTML);
      }

      // 문제 상세
      const detailMatch = url.match(/^\/api\/judge\/problem\/(\d+)$/);
      if (detailMatch) {
        const problem = PROBLEMS.find((p) => p.id === Number(detailMatch[1])) ?? PROBLEMS[0];
        return json(
          res,
          wrap({
            title: `[문제 ${problem.code}] ${problem.title}`,
            description: '두기를 사칭하는 가짜 두기 중 진짜를 찾는 문제입니다.',
            timeLimit: 1,
            memoryLimit: 128,
            points: problem.points,
            createdAt: problem.createdAt,
          }),
        );
      }

      // 문제 목록
      if (url === '/api/judge/problem' && method === 'GET') {
        return json(res, wrap(page(PROBLEMS)));
      }

      // 코드 제출
      if (url === '/api/judge/submission' && method === 'POST') {
        return json(res, wrap({ submissionId: 105, status: 'PENDING', message: '제출이 접수되었습니다.' }));
      }

      // 문제별 내 제출 목록
      const myByProblem = url.match(/^\/api\/judge\/submission\/my\/status\/(\d+)$/);
      if (myByProblem) {
        const pid = Number(myByProblem[1]);
        return json(res, wrap(page(SUBMISSIONS.map((s) => ({ ...s, problemId: pid })))));
      }

      // 내 풀이 현황
      if (url === '/api/judge/submission/my/status') {
        return json(res, wrap({ solvedProblems: [1, 2], incorrectProblems: [3, 4] }));
      }

      // 제출 상세 (소스코드)
      const detailSub = url.match(/^\/api\/judge\/submission\/detail\/(\d+)$/);
      if (detailSub) {
        const found = SUBMISSIONS.find((s) => s.submissionId === Number(detailSub[1])) ?? SUBMISSIONS[0];
        return json(
          res,
          wrap({
            ...found,
            sourceCode: [
              'import java.io.*;',
              'import java.util.*;',
              '',
              'public class Main {',
              '    public static void main(String[] args) throws IOException {',
              '        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));',
              '        int n = Integer.parseInt(br.readLine().trim());',
              '        StringTokenizer st = new StringTokenizer(br.readLine());',
              '        int[] coin = new int[n];',
              '        Map<Integer, Integer> count = new HashMap<>();',
              '        for (int i = 0; i < n; i++) {',
              '            coin[i] = Integer.parseInt(st.nextToken());',
              '            count.merge(coin[i], 1, Integer::sum);',
              '        }',
              '        for (int i = 0; i < n; i++) {',
              '            if (count.get(coin[i]) == 1) { System.out.println(i + 1); return; }',
              '        }',
              '    }',
              '}',
            ].join('\n'),
          }),
        );
      }

      return next();
    });
  },
});
