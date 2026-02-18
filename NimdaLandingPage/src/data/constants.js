
export const CLUB = {
  name: "NIMDA",
  tagline: "정보보안 동아리",
  links: {
    homepage: "https://nimda.space/",
    apply: "https://moaform.com/q/8e13lE",
  },
};

export const DESKTOP_ICONS = [
  {
    id: "about",
    label: "님다소개.txt",
    icon: "/MacIcons/TextEdit.svg",
    windowTitle: "님다소개.txt — 텍스트 편집기",
    type: "text",
    content: `========================================
     NIMDA 정보보안 동아리 소개
========================================

안녕하세요! 👋
NIMDA는 컴퓨터 언어를 기반으로
웹 개발과 정보보안 분야를 함께
공부하고 성장하는 동아리입니다.

멘토·멘티 활동과 스터디,
실전 프로젝트와 대회 참여를 통해
'직접 해보며 배우는 경험'을
가장 중요하게 생각합니다.

────────────────────────────────

📌 주요 활동

🎓 학습
  • 기초 프로그래밍 언어 멘토·멘티 활동
    (C, C++, JavaScript 등)
  • 웹 개발 스터디
    (HTML/CSS, 프론트엔드·백엔드 기초)
  • 웹 해킹, 시스템 보안, CTF 기초 스터디

🏅 도전
  • 대회(ICPC·UCPC) 참여
  • 교내 해커톤 참여
  • 동아리 자체 대회(님다콘) 개최

🔧 응용
  • NIMDA 페이지 기능 추가
  • 보안 문제 풀이 및 취약점 분석 실습

────────────────────────────────

🏆 수상 실적

  2020년 — K-사이버 시큐리티 챌린지 2020
           충청권 지역예선 1등

  2024년 — 2024년 프로보노 ICT멘토링 공모전
           입선

────────────────────────────────

📍 위치: 학생회관 3층 305호
📧 이메일: amazingnimda@gmail.com
🌐 홈페이지: nimda.space

========================================
  NIMDA — 함께 성장하는 보안 동아리
========================================`,
  },
  {
    id: "activities",
    label: "동아리활동",
    icon: "/MacIcons/Folder.svg",
    windowTitle: "동아리활동 — Finder",
    type: "folder",
    content: [
      { title: "스터디 활동" },
      { title: "님다콘" },
      { title: "MT" },
      { title: "회식" },
    ],
  },
  {
    id: "gallery",
    label: "사진",
    icon: "/MacIcons/Photos.svg",
    windowTitle: "사진 — 라이브러리",
    type: "gallery",
    content: [
      { src: "/cpp.jpg", title: "3월~5월 멘토링", desc: "프로그래밍 언어와 알고리즘의 기초 과정 스터디를 진행했습니다." },
      { src: "/UCPC.jpg", title: "6월 UCPC 참가", desc: "총 3개의 팀으로 UCPC에 참가했습니다." },
      { src: "/nimda_MT.jpg", title: "8월 여름 MT", desc: "함께 즐거운 추억을 쌓았습니다." },
      { src: "/Algorithm_study.jpg", title: "8월~9월 멘토링", desc: "알고리즘 스터디를 진행했습니다." },
      { src: "/ICPC.jpg", title: "10월 ICPC 참가", desc: "총 여러 팀으로 ICPC에 참가했습니다." },
      { src: "/activity_nimdacon.jpg", title: "11월 님다콘 개최", desc: "첫 동아리 자체 대회를 개최했습니다." },
    ],
  },
  {
    id: "notes",
    label: "메모",
    icon: "/MacIcons/Notes.svg",
    windowTitle: "메모",
    type: "notes",
    content: {
      notes: [
        {
          title: "📌 NIMDA 가입 안내",
          date: "2026년 2월 16일",
          body: "NIMDA 동아리 가입을 원하시면 아래 링크에서 지원서를 작성해주세요!\n\n🔗 지원 링크: moaform.com/q/8e13lE\n📍 위치: 학생회관 3층 305호\n📧 문의: amazingnimda@gmail.com",
        },
        {
          title: "📅 2025년 활동 요약",
          date: "2025년 12월 31일",
          body: "• 3~5월: 프로그래밍 언어/알고리즘 멘토링\n• 6월: UCPC 참가 (3팀)\n• 8월: 여름 MT\n• 8~9월: 알고리즘 스터디\n• 10월: ICPC 참가\n• 11월: 님다콘 (자체 대회) 개최",
        },
        {
          title: "💡 스터디 주제 아이디어",
          date: "2025년 9월 15일",
          body: "1. 웹 해킹 기초 (OWASP Top 10)\n2. CTF 입문 과정\n3. React & Next.js 프로젝트\n4. 시스템 보안 실습\n5. 알고리즘 문제 풀이 (백준)",
        },
      ],
    },
  },
  {
    id: "messages",
    label: "메시지",
    icon: "/MacIcons/Messages.svg",
    windowTitle: "메시지",
    type: "messages",
    content: {
      contacts: [
        { name: "NIMDA 동아리방", avatar: "🏠", unread: 2, day: "일" },
        { name: "멘토링 스터디", avatar: "📚", unread: 0, day: "토" },
        { name: "CTF 팀", avatar: "🔐", unread: 1, day: "금" },
      ],
      conversations: {
        "NIMDA 동아리방": [
          { sender: "동아리장", time: "오후 2:30", text: "안녕하세요! NIMDA 정보보안 동아리에 오신 것을 환영합니다 🎉", isMe: false },
          { sender: "동아리장", time: "오후 2:31", text: "저희 동아리는 웹 개발과 정보보안을 함께 공부하는 동아리입니다!", isMe: false },
          { sender: "나", time: "오후 2:35", text: "안녕하세요! 컴퓨터 보안에 관심이 많아서 가입하고 싶습니다!", isMe: true },
          { sender: "동아리장", time: "오후 2:36", text: "좋습니다! 멘토·멘티 프로그램으로 기초부터 배울 수 있어요 💪", isMe: false },
          { sender: "동아리장", time: "오후 2:37", text: "C, C++, JavaScript 같은 프로그래밍 언어부터 시작해서 웹 해킹, CTF까지 다양한 활동을 합니다!", isMe: false },
          { sender: "나", time: "오후 2:40", text: "오 대회도 나가나요??", isMe: true },
          { sender: "동아리장", time: "오후 2:41", text: "네! ICPC, UCPC 같은 대회에 참가하고, 님다콘이라는 자체 대회도 개최하고 있어요 🏆", isMe: false },
          { sender: "동아리장", time: "오후 2:42", text: "학생회관 3층 305호로 놀러오세요! 언제든 환영합니다 😊", isMe: false },
          { sender: "나", time: "오후 2:45", text: "감사합니다! 꼭 지원할게요!! 🚀", isMe: true },
        ],
        "멘토링 스터디": [
          { sender: "멘토A", time: "오전 10:00", text: "이번 주 스터디 주제: C++ STL 컨테이너", isMe: false },
          { sender: "멘토A", time: "오전 10:01", text: "vector, map, set 위주로 정리해왔으면 좋겠습니다!", isMe: false },
          { sender: "나", time: "오전 10:15", text: "네 알겠습니다! 준비해갈게요 📝", isMe: true },
        ],
        "CTF 팀": [
          { sender: "팀장", time: "오후 6:00", text: "이번 주말 CTF 대회 같이 참가하실 분?? 🔥", isMe: false },
          { sender: "나", time: "오후 6:05", text: "저 참가하고 싶습니다!", isMe: true },
          { sender: "팀장", time: "오후 6:06", text: "좋아요! 금요일 저녁에 사전 미팅 하겠습니다 💻", isMe: false },
        ],
      },
    },

  },
  {
    id: "terminal",
    label: "터미널",
    icon: "/MacIcons/Terminal.svg",
    windowTitle: "터미널",
    type: "terminal",
    content: null,
  },
  {
    id: "contacts",
    label: "연락처",
    icon: "/MacIcons/Contacts.svg",
    windowTitle: "연락처",
    type: "contacts",
    content: [
      {
        name: "김서윤",
        role: "회장",
        phone: "010-2345-6789",
        email: "seoyoon@nimda.kr",
        avatar: "김",
        color: "#FF9F0A"
      },
      {
        name: "이도현",
        role: "부회장",
        phone: "010-3456-7890",
        email: "dohyun@nimda.kr",
        avatar: "이",
        color: "#30D158"
      },
      {
        name: "정푸른",
        role: "총무",
        phone: "010-4567-8901",
        email: "pureun@nimda.kr",
        avatar: "정",
        color: "#5AC8FA"
      },
    ].sort((a, b) => a.name.localeCompare(b.name)),
  },
  {
    id: "sticker",
    label: "스티커",
    icon: "/MacIcons/Sticker.png",
    windowTitle: "가이드",
    type: "sticker",
    content: {
      intro: "메모를 손쉽게 사용자화할 수 있습니다.",
      sub: "메모를 눈에 띄고 잘 보이게 만들 수 있습니다.",
      features: [
        "다양한 서체 및 서체 크기를 사용하여 텍스트 포맷 지정",
        "볼드 및 이탤릭 텍스트 스타일 또는 색상을 사용하여 강조.",
        "그래픽 포함 🖼️."
      ],
      desc: "스티커에는 맞춤법 검사, 기능 가져오기 및 내보내기, 메모를 정렬하고 사용자화할 수 있는 여러 방법을 포함하여 수많은 멋진 기능이 있습니다. 게다가 많은 응용 프로그램에서 '새로운 스티커 메모 생성' 서비스를 이용할 수 있습니다.\n\n스티커 사용에 관한 자세한 내용은 도움말을 확인하십시오."
    },
  },
];

export const DOCK_ITEMS = [
  { id: "activities", icon: "/MacIcons/Finder.svg", label: "Finder", action: "activities" },
  { id: "sticker", icon: "/MacIcons/Sticker.png", label: "스티커", action: "sticker" },
  { id: "about", icon: "/MacIcons/TextEdit.svg", label: "텍스트 편집기", action: "about" },
  { id: "gallery", icon: "/MacIcons/Photos.svg", label: "사진", action: "gallery" },
  { id: "notes", icon: "/MacIcons/Notes.svg", label: "메모", action: "notes" },
  { id: "messages", icon: "/MacIcons/Messages.svg", label: "메시지", action: "messages" },
  { id: "contacts", icon: "/MacIcons/Contacts.svg", label: "연락처", action: "contacts" },
  { id: "terminal", icon: "/MacIcons/Terminal.svg", label: "터미널", action: "terminal" },
  { id: "safari", icon: "/MacIcons/Safari.svg", label: "Safari", action: "safari" },
];

export const TERMINAL_FS = {
  "/": ["home", "usr", "etc", "var"],
  "/home": ["nimda"],
  "/home/nimda": ["Desktop", "Documents", "Downloads", ".bashrc"],
  "/home/nimda/Desktop": ["님다소개.txt", "동아리활동"],
  "/home/nimda/Desktop/동아리활동": ["스터디 활동", "님다콘", "MT", "회식"],
  "/home/nimda/Desktop/동아리활동/스터디 활동": [],
  "/home/nimda/Desktop/동아리활동/님다콘": [],
  "/home/nimda/Desktop/동아리활동/MT": [],
  "/home/nimda/Desktop/동아리활동/회식": [],
  "/home/nimda/Documents": ["study_notes.md", "ctf_writeup.md"],
  "/home/nimda/Downloads": [],
};
