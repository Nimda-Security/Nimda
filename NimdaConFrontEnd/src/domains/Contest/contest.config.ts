// NIMDACON 대회 설정 — 대회 정보 API가 아직 없어 프론트 설정으로 관리한다.
// 백엔드에 대회 도메인이 생기면 이 파일 값을 fetch 결과로 교체하면 된다.

export const CONTEST = {
  name: 'NIMDACON 2026',
  year: 2026,
  startAt: '2026-03-21T10:00:00+09:00',
  endAt: '2026-03-22T18:00:00+09:00',
  periodLabel: '03.21 ~ 03.22',
  durationLabel: '32시간',
  audience: 'NIMDA 부원',
  tagline: '코드로 방어하고, 알고리즘으로 돌파하라',
  description:
    'NIMDA가 자체 구축한 온라인 저지에서 열리는 교내 알고리즘 · 정보보안 대회입니다.\n제출과 동시에 채점되고, 순위는 실시간으로 공개됩니다.',
  // 참가 신청 페이지가 확정되기 전까지 외부 폼 URL을 사용한다. 비어 있으면 "준비 중" 안내.
  registerUrl: '',
  stats: {
    participants: '42명',
    problems: '6문제',
    tracks: '2개',
    prize: '3,000 NC',
  },
  tracks: [
    {
      key: 'algo',
      kicker: 'TRACK 01',
      title: '알고리즘',
      body: '자료구조 · 그래프 · DP 기반 문제가 출제됩니다. 제출하면 즉시 채점되고 정답 여부와 함께 실행 시간 · 메모리까지 기록됩니다.',
      tags: ['C99', 'C++17', 'Java 17', 'Python 3'],
      accent: '#4a7fcc',
    },
    {
      key: 'sec',
      kicker: 'TRACK 02',
      title: '시큐리티',
      body: '웹 취약점 · 리버싱 · 암호 기초 문제를 풉니다. 취약점을 찾아 NIMDA{...} 형식의 플래그를 제출하는 CTF 방식입니다.',
      tags: ['WEB', 'REVERSING', 'CRYPTO', 'FORENSIC'],
      accent: '#d64454',
    },
    {
      key: 'rank',
      kicker: 'SCORING',
      title: '실시간 랭킹',
      body: '점수 → 소요 시간 → 메모리 순으로 순위가 결정됩니다. 리더보드는 대회 중에도 실시간으로 공개됩니다.',
      tags: ['실시간 채점', '리더보드', '님다 코인'],
      accent: '#5cb85c',
    },
  ],
  timeline: [
    { step: '01', date: '03.10 ~ 03.20', title: '참가 신청', body: '님다 계정으로 신청합니다. 개인전이며 부원이라면 누구나 참가할 수 있습니다.' },
    { step: '02', date: '03.20 19:00', title: '사전 점검', body: '연습 문제로 제출 환경과 언어별 컴파일 옵션을 미리 확인합니다.' },
    { step: '03', date: '03.21 10:00', title: '본 대회', body: '알고리즘 문제와 시큐리티 트랙이 동시에 열립니다. 32시간 동안 진행됩니다.', current: true },
    { step: '04', date: '03.22 20:00', title: '결과 발표', body: '최종 순위를 공개하고 상위 입상자에게 님다 코인을 지급합니다.' },
  ],
  rules: {
    scoring: [
      '알고리즘 문제는 제출 즉시 자동 채점되며 부분 점수는 없습니다.',
      '시큐리티 문제는 플래그 문자열이 정확히 일치할 때만 정답 처리됩니다.',
      '동점자는 마지막 정답 제출 시각이 빠른 참가자가 앞섭니다.',
      '문제당 제출 횟수는 10회로 제한됩니다.',
    ],
    caution: [
      '타인의 코드를 그대로 제출하면 실격 처리됩니다.',
      '저지 서버 자체를 대상으로 한 공격 시도는 금지됩니다.',
      '외부 문서 검색과 개인 코드 아카이브 참고는 허용됩니다.',
      '결과 이의 제기는 발표 후 24시간 내에 접수합니다.',
    ],
  },
} as const;

// value = 백엔드 SupportedLanguage 검증이 받는 표시값("Java"|"Python"|"C++17"|"C99")
// label = 화면 표기, monaco = Monaco Editor 언어 ID
export const LANGUAGES = [
  {
    value: 'C99',
    label: 'C99',
    monaco: 'c',
    template: `#include <stdio.h>

int main() {
    // 여기에 코드를 작성하세요

    return 0;
}`,
  },
  {
    value: 'C++17',
    label: 'C++17',
    monaco: 'cpp',
    template: `#include <iostream>
using namespace std;

int main() {
    // 여기에 코드를 작성하세요

    return 0;
}`,
  },
  {
    value: 'Java',
    label: 'Java 17',
    monaco: 'java',
    template: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // 여기에 코드를 작성하세요

    }
}`,
  },
  {
    value: 'Python',
    label: 'Python 3',
    monaco: 'python',
    template: `import sys
input = sys.stdin.readline

# 여기에 코드를 작성하세요
`,
  },
] as const;

export type ContestLanguage = (typeof LANGUAGES)[number]['value'];

// MOCK: 채점 워커가 아직 없어 제출이 PENDING에 머문다. 데모용 클라이언트 시뮬레이터 스위치.
export const MOCK_JUDGE_ENABLED = true;
