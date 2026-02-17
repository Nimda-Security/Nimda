'use client';
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback, useRef } from "react";

/* ───────────────────────────────────────────
   데이터
   ─────────────────────────────────────────── */

const CLUB = {
  name: "NIMDA",
  tagline: "정보보안 동아리",
  links: {
    homepage: "https://nimda.space/",
    apply: "https://moaform.com/q/8e13lE",
  },
};

const DESKTOP_ICONS = [
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
];

const DOCK_ITEMS = [
  { id: "finder", icon: "/MacIcons/Finder.svg", label: "Finder", action: "activities" },
  { id: "textedit", icon: "/MacIcons/TextEdit.svg", label: "텍스트 편집기", action: "about" },
  { id: "photos", icon: "/MacIcons/Photos.svg", label: "사진", action: "gallery" },
  { id: "notes", icon: "/MacIcons/Notes.svg", label: "메모", action: "notes" },
  { id: "messages", icon: "/MacIcons/Messages.svg", label: "메시지", action: "messages" },
  { id: "contacts", icon: "/MacIcons/Contacts.svg", label: "연락처", action: "contacts" },
  { id: "terminal", icon: "/MacIcons/Terminal.svg", label: "터미널", action: "terminal" },
  { id: "safari", icon: "/MacIcons/Safari.svg", label: "Safari", action: "safari" },
];

/* ───────────────────────────────────────────
   유틸리티
   ─────────────────────────────────────────── */

const getHangulInitial = (str) => {
  const c = str.charCodeAt(0);
  if (c >= 0xAC00 && c <= 0xD7A3) {
    const initialOffset = Math.floor((c - 0xAC00) / 28 / 21);
    const initials = [
      "ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ",
      "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"
    ];
    return initials[initialOffset] || "#";
  }
  return str[0].toUpperCase();
};

/* ───────────────────────────────────────────
   터미널 파일시스템 & 명령어
   ─────────────────────────────────────────── */

const TERMINAL_FS = {
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

function processCommand(cmd, cwd) {
  const trimmed = cmd.trim();
  if (!trimmed) return { output: "", newCwd: cwd };

  const parts = trimmed.split(/\s+/);
  const command = parts[0];
  const args = parts.slice(1);

  switch (command) {
    case "pwd":
      return { output: cwd, newCwd: cwd };

    case "ls": {
      const target = args[0] ? (args[0].startsWith("/") ? args[0] : `${cwd === "/" ? "" : cwd}/${args[0]}`) : cwd;
      const entries = TERMINAL_FS[target];
      if (entries) {
        return { output: entries.length > 0 ? entries.join("  ") : "", newCwd: cwd };
      }
      return { output: `ls: ${args[0] || target}: No such file or directory`, newCwd: cwd };
    }

    case "cd": {
      if (!args[0] || args[0] === "~") {
        return { output: "", newCwd: "/home/nimda" };
      }
      let target;
      if (args[0] === "..") {
        const parts2 = cwd.split("/").filter(Boolean);
        parts2.pop();
        target = "/" + parts2.join("/");
        if (!target || target === "/") target = "/";
      } else if (args[0].startsWith("/")) {
        target = args[0];
      } else {
        const potentialPath = `${cwd === "/" ? "" : cwd}/${args[0]}`;
        // Case-insensitive check
        const matchingKey = Object.keys(TERMINAL_FS).find(
          (k) => k.toLowerCase() === potentialPath.toLowerCase()
        );
        target = matchingKey || potentialPath;
      }
      if (TERMINAL_FS[target] !== undefined) {
        return { output: "", newCwd: target };
      }
      return { output: `cd: no such file or directory: ${args[0]}`, newCwd: cwd };
    }

    case "whoami":
      return { output: "nimda", newCwd: cwd };

    case "hostname":
      return { output: "nimda-macbook.local", newCwd: cwd };

    case "date": {
      const now = new Date();
      return { output: now.toString(), newCwd: cwd };
    }

    case "echo":
      return { output: args.join(" "), newCwd: cwd };

    case "cat": {
      if (!args[0]) return { output: "cat: missing operand", newCwd: cwd };
      if (args[0] === "님다소개.txt" || args[0] === "/home/nimda/Desktop/님다소개.txt") {
        return { output: "NIMDA 정보보안 동아리\n웹 개발과 정보보안을 함께 공부하는 동아리입니다.\n📍 위치: 학생회관 3층 305호\n📧 이메일: amazingnimda@gmail.com", newCwd: cwd };
      }
      return { output: `cat: ${args[0]}: No such file or directory`, newCwd: cwd };
    }

    case "uname":
      return { output: args.includes("-a") ? "NIMDA-OS nimda-macbook.local 1.0.0 NIMDA-OS x86_64" : "NIMDA-OS", newCwd: cwd };

    case "clear":
      return { output: "__CLEAR__", newCwd: cwd };

    case "help":
      return {
        output: "사용 가능한 명령어:\n  pwd       - 현재 디렉토리 출력\n  ls        - 파일 목록 출력\n  cd <dir>  - 디렉토리 이동\n  cat <file>- 파일 내용 출력\n  whoami    - 사용자 이름 출력\n  hostname  - 호스트 이름 출력\n  date      - 현재 날짜/시간 출력\n  echo      - 텍스트 출력\n  uname     - 시스템 정보 출력\n  clear     - 화면 지우기\n  help      - 명령어 목록 출력",
        newCwd: cwd,
      };

    default:
      return { output: `zsh: command not found: ${command}`, newCwd: cwd };
  }
}

/* ───────────────────────────────────────────
   부팅 화면 컴포넌트
   ─────────────────────────────────────────── */

function BootScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 400);
          return 100;
        }
        return p + 2;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div
      className="boot-screen"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <img src="/nimdalogo1.png" alt="NIMDA" className="boot-logo" />
      <div className="boot-progress-track">
        <motion.div
          className="boot-progress-bar"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
        />
      </div>
    </motion.div>
  );
}

/* ───────────────────────────────────────────
   메뉴바 컴포넌트
   ─────────────────────────────────────────── */

function MenuBar() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
      const day = dayNames[now.getDay()];
      const hours = now.getHours();
      const ampm = hours < 12 ? "오전" : "오후";
      const h12 = hours % 12 || 12;
      const fmt = `${now.getMonth() + 1}월 ${now.getDate()}일 (${day}) ${ampm} ${h12}:${String(now.getMinutes()).padStart(2, "0")}`;
      setTime(fmt);
    };
    update();
    const id = setInterval(update, 10000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="menubar">
      <div className="menubar-left">
        <span className="menubar-apple">
          <img src="/nimdalogo1.png" alt="" className="menubar-logo" />
        </span>
        <span className="menubar-app-name">NIMDA</span>
        <span className="menubar-menu-item">파일</span>
        <span className="menubar-menu-item">편집</span>
        <span className="menubar-menu-item">보기</span>
        <span className="menubar-menu-item">도움말</span>
      </div>
      <div className="menubar-right">
        <span className="menubar-battery-text">100%</span>
        <img src="/MacIcons/battery_full.svg" alt="배터리" className="menubar-battery" />
        <img src="/MacIcons/wifi.svg" alt="Wi-Fi" className="menubar-wifi" />
        <span className="menubar-time">{time}</span>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────
   Dock 컴포넌트
   ─────────────────────────────────────────── */

function Dock({ onItemClick }) {
  return (
    <div className="dock-wrapper">
      <div className="dock">
        {DOCK_ITEMS.map((item, index) => (
          <div key={item.id} className="dock-item-container">
            {index === 1 && <div className="dock-separator" />}
            <button
              className="dock-item"
              onClick={() => onItemClick(item.action)}
            >
              <img src={item.icon} alt={item.label} className="dock-icon-img" />
              <span className="dock-tooltip">{item.label}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────
   바탕화면 아이콘
   ─────────────────────────────────────────── */

function DesktopIcon({ icon, onClick }) {
  return (
    <button
      className="desktop-icon"
      onClick={onClick}
    >
      <img src={icon.icon} alt={icon.label} className="desktop-icon-img" />
      <span className="desktop-icon-label">{icon.label}</span>
    </button>
  );
}

/* ───────────────────────────────────────────
   터미널 콘텐츠
   ─────────────────────────────────────────── */

function TerminalContent() {
  const [history, setHistory] = useState([
    { type: "output", text: "Last login: Mon Feb 16 19:00:00 on ttys000" },
  ]);
  const [input, setInput] = useState("");
  const [cwd, setCwd] = useState("/home/nimda");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const getPrompt = () => {
    let displayPath = cwd;
    if (displayPath.startsWith("/home/nimda")) {
      displayPath = displayPath.replace("/home/nimda", "~");
    }
    return `nimda@nimda-macbook ${displayPath || "/"} % `;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const prompt = getPrompt();
    const result = processCommand(input, cwd);

    if (result.output === "__CLEAR__") {
      setHistory([]);
      setCwd(result.newCwd);
      setInput("");
      return;
    }

    const newEntries = [
      { type: "input", text: `${prompt}${input}` },
    ];
    if (result.output) {
      newEntries.push({ type: "output", text: result.output });
    }

    setHistory((prev) => [...prev, ...newEntries]);
    setCwd(result.newCwd);
    setInput("");
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div className="window-terminal-content" onClick={handleContainerClick}>
      <div className="terminal-output">
        {history.map((entry, i) => (
          <div key={i} className={`terminal-line ${entry.type}`}>
            {entry.text}
          </div>
        ))}
      </div>
      <form className="terminal-input-line" onSubmit={handleSubmit}>
        <span className="terminal-prompt">{getPrompt()}</span>
        <input
          ref={inputRef}
          type="text"
          className="terminal-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoFocus
          spellCheck={false}
          autoComplete="off"
        />
      </form>
      <div ref={bottomRef} />
    </div>
  );
}

/* ───────────────────────────────────────────
   윈도우 콘텐츠 렌더러
   ─────────────────────────────────────────── */

function WindowContent({ icon }) {
  const [lightboxImage, setLightboxImage] = useState(null);
  const [selectedNote, setSelectedNote] = useState(0);
  const [selectedChat, setSelectedChat] = useState("NIMDA 동아리방");
  const [selectedContactId, setSelectedContactId] = useState(0);
  const [contactSearchQuery, setContactSearchQuery] = useState("");

  if (icon.type === "terminal") {
    return <TerminalContent />;
  }

  if (icon.type === "text") {
    return (
      <div className="window-text-content">
        <pre className="text-file">{icon.content}</pre>
      </div>
    );
  }

  /* ─── Finder / 폴더 (다크모드 + 폴더그리드) ─── */
  if (icon.type === "folder") {
    return (
      <div className="window-folder-content">
        <div className="finder-sidebar">
          <div className="finder-sidebar-section">
            <div className="finder-sidebar-title">즐겨찾기</div>
            <div className="finder-sidebar-item">
              <span className="finder-sidebar-icon">🖥</span>AirDrop
            </div>
            <div className="finder-sidebar-item">
              <span className="finder-sidebar-icon">🕐</span>최근 항목
            </div>
            <div className="finder-sidebar-item">
              <span className="finder-sidebar-icon">📂</span>응용 프로그램
            </div>
            <div className="finder-sidebar-item active">
              <span className="finder-sidebar-icon">⬇️</span>동아리활동
            </div>
            <div className="finder-sidebar-item">
              <span className="finder-sidebar-icon">📁</span>다운로드
            </div>
          </div>
          <div className="finder-sidebar-section">
            <div className="finder-sidebar-title">NIMDA Cloud</div>
            <div className="finder-sidebar-item">
              <span className="finder-sidebar-icon">🔗</span>공유
            </div>
            <div className="finder-sidebar-item">
              <span className="finder-sidebar-icon">☁️</span>NIMDA Drive
            </div>
            <div className="finder-sidebar-item">
              <span className="finder-sidebar-icon">🖥</span>데스크탑
            </div>
            <div className="finder-sidebar-item">
              <span className="finder-sidebar-icon">📄</span>문서
            </div>
          </div>
          <div className="finder-sidebar-section">
            <div className="finder-sidebar-title">태그</div>
            <div className="finder-sidebar-item">
              <span className="finder-tag-dot" style={{ background: '#ff3b30' }}></span>빨강
            </div>
            <div className="finder-sidebar-item">
              <span className="finder-tag-dot" style={{ background: '#ff9500' }}></span>주황
            </div>
            <div className="finder-sidebar-item">
              <span className="finder-tag-dot" style={{ background: '#34c759' }}></span>초록
            </div>
            <div className="finder-sidebar-item">
              <span className="finder-tag-dot" style={{ background: '#007aff' }}></span>파랑
            </div>
          </div>
        </div>
        <div className="finder-main-wrapper">
          {/* macOS Finder 상단 도구막대 */}
          <div className="finder-toolbar">
            <div className="finder-toolbar-left">
              <button className="finder-toolbar-btn" aria-label="뒤로">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8 1L3 6L8 11" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <button className="finder-toolbar-btn" aria-label="앞으로">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4 1L9 6L4 11" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <span className="finder-toolbar-title">동아리활동</span>
            </div>
            <div className="finder-toolbar-right">
              <div className="finder-view-modes">
                <button className="finder-view-btn active" aria-label="아이콘 보기">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" fill="currentColor"/><rect x="8" y="1" width="5" height="5" rx="1" fill="currentColor"/><rect x="1" y="8" width="5" height="5" rx="1" fill="currentColor"/><rect x="8" y="8" width="5" height="5" rx="1" fill="currentColor"/></svg>
                </button>
                <button className="finder-view-btn" aria-label="목록 보기">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="2" width="12" height="1.5" rx="0.5" fill="currentColor"/><rect x="1" y="6" width="12" height="1.5" rx="0.5" fill="currentColor"/><rect x="1" y="10" width="12" height="1.5" rx="0.5" fill="currentColor"/></svg>
                </button>
                <button className="finder-view-btn" aria-label="컬럼 보기">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="3.5" height="12" rx="0.5" fill="currentColor"/><rect x="5.5" y="1" width="3.5" height="12" rx="0.5" fill="currentColor"/><rect x="10" y="1" width="3.5" height="12" rx="0.5" fill="currentColor"/></svg>
                </button>
              </div>
              <div className="finder-toolbar-search">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="5" cy="5" r="3.5" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2"/><path d="M8 8L10.5 10.5" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" strokeLinecap="round"/></svg>
                <span>검색</span>
              </div>
            </div>
          </div>
          <div className="finder-main">
            <div className="finder-folder-grid">
              {icon.content.map((cat, i) => (
                <button key={i} className="finder-folder-item">
                  <div className="finder-folder-icon-wrapper">
                    <img className="finder-folder-icon-img" src="/MacIcons/Folder.svg" alt="folder" draggable={false} />
                  </div>
                  <span className="finder-folder-name">{cat.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ─── Photos (사진) — macOS 스타일 그리드 + 라이트박스 ─── */
  if (icon.type === "gallery") {
    return (
      <>
        <div className="window-gallery-content">
          <div className="gallery-sidebar">
            <div className="gallery-sidebar-section">
              <div className="gallery-sidebar-title">보관함</div>
              <button className="gallery-sidebar-item active">
                <span className="gallery-sidebar-icon">🖼</span>모든 사진
              </button>
              <button className="gallery-sidebar-item">
                <span className="gallery-sidebar-icon">❤️</span>즐겨찾기
              </button>
              <button className="gallery-sidebar-item">
                <span className="gallery-sidebar-icon">🕐</span>최근 항목
              </button>
            </div>
            <div className="gallery-sidebar-section">
              <div className="gallery-sidebar-title">모음</div>
              <button className="gallery-sidebar-item">
                <span className="gallery-sidebar-icon">📅</span>날짜
              </button>
              <button className="gallery-sidebar-item">
                <span className="gallery-sidebar-icon">💭</span>추억
              </button>
              <button className="gallery-sidebar-item">
                <span className="gallery-sidebar-icon">✈️</span>여행
              </button>
            </div>
            <div className="gallery-sidebar-section">
              <div className="gallery-sidebar-title">미디어 유형</div>
              <button className="gallery-sidebar-item">
                <span className="gallery-sidebar-icon">🎬</span>비디오
              </button>
              <button className="gallery-sidebar-item">
                <span className="gallery-sidebar-icon">📸</span>셀피
              </button>
            </div>
          </div>
          <div className="gallery-main">
            <div className="gallery-date-header">2025년 활동 사진</div>
            <div className="gallery-date-sub">{icon.content.length}장의 사진</div>
            <div className="gallery-grid">
              {icon.content.map((img, i) => (
                <button
                  key={i}
                  className="gallery-grid-item"
                  onClick={() => setLightboxImage(img)}
                >
                  <img src={img.src} alt={img.title} />
                  <div className="gallery-grid-caption">{img.title}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 라이트박스 오버레이 */}
        <AnimatePresence>
          {lightboxImage && (
            <motion.div
              className="lightbox-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightboxImage(null)}
            >
              <button className="lightbox-close" onClick={() => setLightboxImage(null)}>✕</button>
              <motion.img
                className="lightbox-image"
                src={lightboxImage.src}
                alt={lightboxImage.title}
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
              />
              <div className="lightbox-caption">
                <h3>{lightboxImage.title}</h3>
                <p>{lightboxImage.desc}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  /* ─── Notes (메모) — 다크 모드 ─── */
  if (icon.type === "notes") {
    const notes = icon.content.notes;
    return (
      <div className="window-notes-content">
        <div className="notes-sidebar">
          <div className="notes-sidebar-header">
            <span className="notes-count">{notes.length}개의 메모</span>
          </div>
          {notes.map((note, i) => (
            <button
              key={i}
              className={`notes-sidebar-item ${selectedNote === i ? "active" : ""}`}
              onClick={() => setSelectedNote(i)}
            >
              <div className="notes-item-title">{note.title}</div>
              <div className="notes-item-date">{note.date}</div>
              <div className="notes-item-preview">{note.body.substring(0, 40)}...</div>
            </button>
          ))}
        </div>
        <div className="notes-main">
          <div className="notes-header">
            <h2 className="notes-title">{notes[selectedNote].title}</h2>
            <span className="notes-date">{notes[selectedNote].date}</span>
          </div>
          <div className="notes-body">
            {notes[selectedNote].body.split('\n').map((line, i) => (
              <p key={i}>{line || '\u00A0'}</p>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ─── Messages (메시지) — 다크 모드 + 검색바 ─── */
  if (icon.type === "messages") {
    const { contacts, conversations } = icon.content;
    const chatMessages = conversations[selectedChat] || [];
    return (
      <div className="window-messages-content">
        <div className="messages-sidebar">
          <div className="messages-search-bar">
            <input
              type="text"
              className="messages-search-input"
              placeholder="🔍 검색"
              readOnly
            />
          </div>
          {contacts.map((c) => (
            <button
              key={c.name}
              className={`messages-contact ${selectedChat === c.name ? "active" : ""}`}
              onClick={() => setSelectedChat(c.name)}
            >
              <span className="messages-avatar">{c.avatar}</span>
              <div className="messages-contact-info">
                <span className="messages-contact-name">{c.name}</span>
                <div className="messages-contact-meta">
                  <span className="messages-contact-day">{c.day}</span>
                  <span className="messages-contact-preview">
                    {conversations[c.name]?.[conversations[c.name].length - 1]?.text.substring(0, 20)}...
                  </span>
                </div>
              </div>
              {c.unread > 0 && <span className="messages-unread">{c.unread}</span>}
            </button>
          ))}
        </div>
        <div className="messages-main">
          <div className="messages-header">
            <span className="messages-header-label">받는 사람:</span>
            <span className="messages-header-name">{selectedChat}</span>
          </div>
          <div className="messages-body">
            {chatMessages.map((msg, i) => {
              const prev = chatMessages[i - 1];
              const isSameSender = prev && prev.isMe === msg.isMe && prev.sender === msg.sender;
              return (
                <div key={i} className={`message-row ${msg.isMe ? "me" : "other"} ${isSameSender ? "consecutive" : ""}`}>
                  {!msg.isMe && !isSameSender && <span className="message-sender">{msg.sender}</span>}
                  <div className={`message-bubble ${msg.isMe ? "me" : "other"}`}>
                    {msg.text}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="messages-input-bar">
            <input type="text" placeholder="iMessage" className="messages-input" readOnly />
          </div>
        </div>
      </div>
    );
  }



  /* ─── Contacts (연락처) ─── */
  if (icon.type === "contacts") {
    const contacts = icon.content;

    const filteredContacts = contacts.filter(c =>
      c.name.includes(contactSearchQuery) || c.role.includes(contactSearchQuery)
    );

    const selected = filteredContacts[selectedContactId] || filteredContacts[0] || {};

    const grouped = filteredContacts.reduce((acc, contact, idx) => {
      const init = getHangulInitial(contact.name);
      if (!acc[init]) acc[init] = [];
      acc[init].push({ ...contact, originalIndex: idx });
      return acc;
    }, {});
    const sortedKeys = Object.keys(grouped).sort();

    return (
      <div className="window-contacts-content">
        <div className="contacts-sidebar">
          <div className="contacts-search-bar">
            <svg className="contacts-search-icon" width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="5" cy="5" r="3.5" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2"/><path d="M8 8L10.5 10.5" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" strokeLinecap="round"/></svg>
            <input
              type="text"
              placeholder="검색"
              className="contacts-search-input"
              value={contactSearchQuery}
              onChange={(e) => {
                setContactSearchQuery(e.target.value);
                setSelectedContactId(0);
              }}
            />
          </div>
          <div className="contacts-list-container">
            {sortedKeys.map(key => (
              <div key={key}>
                <div className="contacts-section-header">{key}</div>
                {grouped[key].map(c => (
                  <button
                    key={c.name}
                    className={`contacts-sidebar-item ${selectedContactId === c.originalIndex ? "active" : ""}`}
                    onClick={() => setSelectedContactId(c.originalIndex)}
                  >
                    <span className="contacts-sidebar-name">{c.name}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="contacts-main">
          <div className="contacts-profile-top">
            <div className="contacts-avatar-large" style={{ backgroundColor: selected.color || "#8E8E93" }}>
              {selected.avatar}
            </div>
            <h2 className="contacts-name-large">{selected.name}</h2>
            <p className="contacts-role">{selected.role}</p>
          </div>

          <div className="contacts-actions">
            <button className="contacts-action-btn">
              <div className="contacts-action-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z"/></svg>
              </div>
              <span>메시지</span>
            </button>
            <button className="contacts-action-btn">
              <div className="contacts-action-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79C8.06 13.62 10.38 15.94 13.21 17.38L15.41 15.18C15.69 14.9 16.08 14.82 16.43 14.93C17.55 15.3 18.75 15.5 20 15.5C20.55 15.5 21 15.95 21 16.5V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.5C8.05 3 8.5 3.45 8.5 4C8.5 5.25 8.7 6.45 9.07 7.57C9.18 7.92 9.1 8.31 8.82 8.59L6.62 10.79Z"/></svg>
              </div>
              <span>통화</span>
            </button>
            <button className="contacts-action-btn">
              <div className="contacts-action-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V7C17 6.45 16.55 6 16 6H4C3.45 6 3 6.45 3 7V17C3 17.55 3.45 18 4 18H16C16.55 18 17 17.55 17 17V13.5L21 17.5V6.5L17 10.5Z"/></svg>
              </div>
              <span>비디오</span>
            </button>
            <button className="contacts-action-btn">
              <div className="contacts-action-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z"/></svg>
              </div>
              <span>메일</span>
            </button>
          </div>

          <div className="contacts-card">
            <div className="contacts-card-row">
              <span className="contacts-card-label">휴대전화</span>
              <span className="contacts-card-value link">{selected.phone || ""}</span>
            </div>
            <div className="contacts-card-divider" />
            <div className="contacts-card-row">
              <span className="contacts-card-label">이메일</span>
              <span className="contacts-card-value link">{selected.email || ""}</span>
            </div>
          </div>

          <div className="contacts-card">
            <div className="contacts-card-row facetime-row">
              <div>
                <span className="contacts-card-label">FaceTime</span>
                <span className="contacts-card-value">{selected.phone || ""}</span>
              </div>
              <div className="contacts-facetime-icons">
                <div className="contacts-ft-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V7C17 6.45 16.55 6 16 6H4C3.45 6 3 6.45 3 7V17C3 17.55 3.45 18 4 18H16C16.55 18 17 17.55 17 17V13.5L21 17.5V6.5L17 10.5Z"/></svg>
                </div>
                <div className="contacts-ft-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79C8.06 13.62 10.38 15.94 13.21 17.38L15.41 15.18C15.69 14.9 16.08 14.82 16.43 14.93C17.55 15.3 18.75 15.5 20 15.5C20.55 15.5 21 15.95 21 16.5V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.5C8.05 3 8.5 3.45 8.5 4C8.5 5.25 8.7 6.45 9.07 7.57C9.18 7.92 9.1 8.31 8.82 8.59L6.62 10.79Z"/></svg>
                </div>
              </div>
            </div>
          </div>

          <div className="contacts-card">
            <div className="contacts-card-row">
              <span className="contacts-card-label">메모</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

/* ───────────────────────────────────────────
   Finder 윈도우
   ─────────────────────────────────────────── */

function FinderWindow({ icon, zIndex, onClose, onFocus, position }) {
  const [pos, setPos] = useState(position);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e) => {
    if (e.target.closest('.traffic-btn')) return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    });
    onFocus();
  }, [pos, onFocus]);

  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e) => {
      setPos({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    };
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // 윈도우 크기를 타입에 따라 다르게
  const widthClass = icon.type === "messages" ? "window-wide" : icon.type === "gallery" ? "window-wide" : icon.type === "terminal" ? "window-terminal" : icon.type === "folder" ? "window-wide" : icon.type === "contacts" ? "window-wide" : "";

  // Finder(폴더)는 타이틀바 숨기고 toolbar에 통합
  const showTitlebar = icon.type !== "folder";

  return (
    <motion.div
      className={`finder-window ${widthClass}`}
      style={{ left: pos.x, top: pos.y, zIndex }}
      initial={{ scale: 0.85, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.85, opacity: 0, y: 20 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      onMouseDown={onFocus}
    >
      {showTitlebar ? (
        <div className="window-titlebar" onMouseDown={handleMouseDown}>
          <div className="traffic-lights">
            <button className="traffic-btn close" onClick={onClose} aria-label="닫기">
              <svg width="6" height="6" viewBox="0 0 6 6"><path d="M0 0L6 6M6 0L0 6" stroke="rgba(77,0,0,0.6)" strokeWidth="1.2"/></svg>
            </button>
            <button className="traffic-btn minimize" aria-label="최소화">
              <svg width="8" height="2" viewBox="0 0 8 2"><path d="M0 1H8" stroke="rgba(77,50,0,0.6)" strokeWidth="1.2"/></svg>
            </button>
            <button className="traffic-btn maximize" aria-label="최대화">
              <svg width="6" height="6" viewBox="0 0 6 6"><path d="M0 1.5V5.5H4M1.5 0.5H5.5V4.5" stroke="rgba(0,77,0,0.6)" strokeWidth="1"/></svg>
            </button>
          </div>
          <span className="window-title">{icon.windowTitle}</span>
          <div style={{ width: 52 }} />
        </div>
      ) : (
        <div className="window-titlebar finder-titlebar" onMouseDown={handleMouseDown}>
          <div className="traffic-lights">
            <button className="traffic-btn close" onClick={onClose} aria-label="닫기">
              <svg width="6" height="6" viewBox="0 0 6 6"><path d="M0 0L6 6M6 0L0 6" stroke="rgba(77,0,0,0.6)" strokeWidth="1.2"/></svg>
            </button>
            <button className="traffic-btn minimize" aria-label="최소화">
              <svg width="8" height="2" viewBox="0 0 8 2"><path d="M0 1H8" stroke="rgba(77,50,0,0.6)" strokeWidth="1.2"/></svg>
            </button>
            <button className="traffic-btn maximize" aria-label="최대화">
              <svg width="6" height="6" viewBox="0 0 6 6"><path d="M0 1.5V5.5H4M1.5 0.5H5.5V4.5" stroke="rgba(0,77,0,0.6)" strokeWidth="1"/></svg>
            </button>
          </div>
          <div style={{ flex: 1 }} />
        </div>
      )}
      <div className={`window-body ${icon.type === "folder" ? "window-body-finder" : ""}`}>
        <WindowContent icon={icon} />
      </div>
    </motion.div>
  );
}

/* ───────────────────────────────────────────
   메인 페이지
   ─────────────────────────────────────────── */

export default function Page() {
  const [booted, setBooted] = useState(false);
  const [openWindows, setOpenWindows] = useState([]);
  const [topZ, setTopZ] = useState(100);

  const handleBoot = useCallback(() => setBooted(true), []);

  const openWindow = useCallback((iconId) => {
    // Safari → 동아리 페이지 / 지원 링크 선택 메뉴
    if (iconId === "safari") {
      window.open(CLUB.links.homepage, "_blank");
      return;
    }
    setOpenWindows((prev) => {
      const exists = prev.find((w) => w.id === iconId);
      if (exists) {
        setTopZ((z) => z + 1);
        return prev.map((w) =>
          w.id === iconId ? { ...w, zIndex: topZ + 1 } : w
        );
      }
      const offset = prev.length * 30;
      setTopZ((z) => z + 1);
      return [
        ...prev,
        {
          id: iconId,
          zIndex: topZ + 1,
          position: {
            x: 120 + offset,
            y: 60 + offset,
          },
        },
      ];
    });
  }, [topZ]);

  const closeWindow = useCallback((iconId) => {
    setOpenWindows((prev) => prev.filter((w) => w.id !== iconId));
  }, []);

  const focusWindow = useCallback((iconId) => {
    setTopZ((z) => {
      const newZ = z + 1;
      setOpenWindows((prev) =>
        prev.map((w) => (w.id === iconId ? { ...w, zIndex: newZ } : w))
      );
      return newZ;
    });
  }, []);

  return (
    <main className="macos-root">
      <AnimatePresence mode="wait">
        {!booted && <BootScreen key="boot" onComplete={handleBoot} />}
      </AnimatePresence>

      {booted && (
        <motion.div
          className="desktop-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <MenuBar />

          <div className="desktop">
            <div className="desktop-background">
              <div className="bg-layer gradient" />
              <div className="bg-layer logo" />
              <div className="bg-layer noise" />
              <div className="bg-layer pattern" />
            </div>
            <div className="desktop-icons-grid">
              {DESKTOP_ICONS.filter((icon) => ["about", "activities"].includes(icon.id)).map((icon) => (
                <DesktopIcon
                  key={icon.id}
                  icon={icon}
                  onClick={() => openWindow(icon.id)}
                />
              ))}
            </div>

            <AnimatePresence>
              {openWindows.map((w) => {
                const icon = DESKTOP_ICONS.find((i) => i.id === w.id);
                if (!icon) return null;
                return (
                  <FinderWindow
                    key={w.id}
                    icon={icon}
                    zIndex={w.zIndex}
                    position={w.position}
                    onClose={() => closeWindow(w.id)}
                    onFocus={() => focusWindow(w.id)}
                  />
                );
              })}
            </AnimatePresence>
          </div>

          <Dock onItemClick={openWindow} />
        </motion.div>
      )}
    </main>
  );
}