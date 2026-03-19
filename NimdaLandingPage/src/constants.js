export const CLUB = {
  name: "NIMDA",
  tagline: "정보보안 동아리",
  shortIntro: [
    "NIMDA",
  ],
  links: {
    homepage: "https://nimda.space/", // 서브도메인으로 교체
    apply: "https://moaform.com/q/8e13lE",   // 지원 링크로 교체
  },
};

export const C_CODE = `
#include <stdio.h>
#include <unistd.h> // for sleep()

int main() {
    char nimda_message[] = "Welcome to NIMDA Security Club!";
    int i = 0;

    printf("Booting up system...\\n");
    sleep(1);

    while (nimda_message[i] != '\\\\0') {
        printf("%c", nimda_message[i]);
        fflush(stdout);
        usleep(50000);
        i++;
    }
    printf("\\\\n");
    printf("Access Granted.\\\\n");
    return 0;
}
`.trim();

export const ACTIVITIES = [
  {
    point: "학습",
    title: "멘토·멘티 활동과 스터디",
    items: [
      <>
      기초 프로그래밍 언어 멘토·멘티 활동<br/>
      (C, C++, JavaScript 등)
      </>,
      <>
      웹 개발 스터디<br/>
      (HTML/CSS, 프론트엔드·백엔드 기초)
      </>, "웹 해킹, 시스템 보안, CTF 기초 스터디"],
  },
  {
    point: "도전",
    title: "대회 & 해커톤 참여",
    items: ["대회(ICPC·UCPC) 참여", "교내 해커톤 참여", "동아리 자체 대회(님다콘) 개최"],
  },
  {
    point: "응용",
    title: "프로젝트 & 실습 활동",
    items: ["NIMDA 페이지 기능 추가", "보안 문제 풀이 및 취약점 분석 실습"],
  },
];

export const AWARDS = [
  {
    year: "2020",
    name: "K-사이버 시큐리티 챌린지 2020",
    result: "충청권 지역예선 1등",
  },
  {
    year: "2024",
    name: "2024년 프로보노 ICT멘토링 공모전",
    result: "입선",
  },
 
];

/* 2025년 활동 데이터 (예시) */
export const ACTIVITIES_2025 = [
  { title: "3월~5월 멘토링",
    desc: "프로그래밍 언어와 알고리즘의 기초 과정 스터디를 진행했습니다.",
    image: "cpp.jpg"
  },
  { title: "6월 UCPC 참가",
    desc: "총 3개의 팀으로 UCPC에 참가했습니다.",
    image: "UCPC.jpg"
  },
  { title: "8월 여름 MT",
    desc: "함께 즐거운 추억을 쌓았습니다.",
    image: "nimda_MT.jpg"
  },
  { title: "8월~9월 멘토링, 스터디",
    desc: "알고리즘 스터디를 진행했습니다.",
    image: "Algorithm_study.jpg"
  },
  { title: "10월 ICPC 참가",
    desc: "총 o개의 팀으로 ICPC에 참가했습니다.",
    image: "ICPC.jpg"
  },
  { title: "11월 님다콘 개최",
    desc: "첫 동아리 자체 대회를 개최하여 그동안 쌓아온 실력을 발휘할 수 있는 장을 마련했습니다. ",
    image: "activity_nimdacon.jpg"
  }
];
