'use client';
import { motion } from "framer-motion";

const CLUB = {
  name: "NIMDA",
  tagline: "보안 동아리",
  shortIntro: [
    "NIMDA",
  ],
  stats: [
    { label: "활동 기수", value: "10+" },
    { label: "누적 프로젝트", value: "30+" },
    { label: "대회/해커톤 수상", value: "15+" },
  ],
  links: {
    homepage: "https://www.nimda.kr/", // 서브도메인으로 교체
    apply: "https://apply.example.com",   // 지원 링크로 교체
  },
};

const ACTIVITIES = [
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

const AWARDS = [
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
const ACTIVITIES_2025 = [
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

]

function Container({ children }) {
  return <div className="container">{children}</div>;
}

function SectionHeader({ eyebrow, title, desc }) {
  return (
    <div className="sectionHeader">
      <div className="eyebrow">{eyebrow}</div>
      <h2 className="h2">{title}</h2>
      {desc ? <p className="p muted">{desc}</p> : null}
    </div>
  );
}

function Card({ title, desc, children }) {
  return (
    <div className="card">
      <div className="cardTop">
        <h3 className="h3">{title}</h3>
        {desc ? <p className="p muted">{desc}</p> : null}
      </div>
      {children}
    </div>
  );
}

export default function Page() {
  return (
    <div className="page">
      {/* Navbar */}
      <header className="navWrap">
        <Container>
          <nav className="nav">
            <a className="brand" href="#top" aria-label="Go to top">
              <img
                src="/nimdalogo1.png"
                alt="NIMDA 로고"
                className="brandIcon"
              />
              <span className="brandText">NIMDA</span>
            </a>


            <div className="navLinks">
              <a className="navLink" href="#about">동아리 소개</a>
              <a className="navLink" href="#activities">동아리 활동</a>
              <a className="navLink" href="#awards">수상 실적</a>
              <a
                className="navLink"
                href={CLUB.links.homepage}
                target="_blank"
                rel="noreferrer"
              >
                동아리 홈페이지 바로가기
              </a>
              <a
                className="navCta"
                href={CLUB.links.apply}
                target="_blank"
                rel="noreferrer"
              >
                지원하러 가기
              </a>
            </div>
          </nav>
        </Container>
      </header>

      {/* Hero */}
      <main id="top" className="hero">
        <Container>
          <div className="heroGrid">
            <div className="heroLeftCentered">
              {/* '개발 동아리' 타이틀 */}
              <h1 className="h1">{CLUB.tagline}</h1>
              
              {/* 'NIMDA' 메인 글자 */}
              <div className="heroP">
                {CLUB.name}
              </div>
            </div>
          </div>
        </Container>
      </main>

      {/* About */}
      <section id="about" className="section">
        <Container>
          <SectionHeader
            title="동아리는 어떤 곳인가요?"
            desc={
              <>
              NIMDA는 <span className="highlight1">컴퓨터 언어</span>를 기반으로 <span className="highlight2">웹 개발</span>과 <span className="highlight2">정보보안</span> 분야를 함께 공부하고 성장하는 동아리입니다.<br/>
              멘토·멘티 활동과 스터디, 실전 프로젝트와 대회 참여를 통해 <span className="highlight3">‘직접 해보며 배우는 경험’</span>을 가장 중요하게 생각합니다.
              </>
            }
          />

          
        </Container>
      </section>

      {/* Activities*/}
      <section id="activities" className="section sectionAlt">
        <Container>
          <SectionHeader
            title="동아리 활동"
            desc={
              <>
              님다의 활동은 크게 <span className="emphasis">‘학습 → 도전 → 응용’</span>의 흐름으로 공부에만 그치지 않고, <span className="emphasis">‘경험’</span>으로 이어집니다.
              </>
            }
          />
          <div className="grid3 roadmap-container">
            {/* CSS ::before 가 가로선을 그립니다 */}
            {ACTIVITIES.map((a, index) => (
              <div key={a.title} className="roadmap-item">
                {/* 1. 위에서 떨어질 카드 박스: motion.div로 변경 */}
                <motion.div 
                  className="roadmap-card"
                  initial={{ opacity: 0, y: -50 }}      // 시작 상태: 투명하고 위로 50px
                  whileInView={{ opacity: 1, y: 0 }}   // 화면에 들어왔을 때: 불투명하고 제자리로
                  viewport={{ once: false, amount: 0.3 }} // ★ once: false가 핵심 (볼 때마다 애니메이션 실행)
                  transition={{ 
                    duration: 0.6, 
                    delay: index * 0.2,               // 순차적으로 떨어지는 효과
                    ease: "easeOut" 
                  }}
                >
                  <Card title={a.title}>
                    {Array.isArray(a.items) && (
                      <ul className="list">
                        {a.items.map((it, idx) => (
                          <li key={idx}>{it}</li>
                        ))}
                      </ul>
                    )}
                  </Card>
                </motion.div>

                {/* 2. 중앙의 점 (여기도 원하시면 같이 애니메이션을 줄 수 있습니다) */}
                <div className={`point${index+1}`}></div>
                
                {/* 3. 점 아래의 타이틀 */}
                <div className="roadmap-title">{a.point}</div>
              </div>
            ))}
          </div>
        
        </Container>
      </section>
      
      {/* Activities2025 (무한 스크롤 버전) */}
      <section id="activities2025" className="section">
        <Container>
          <SectionHeader
            title="2025년에는 무엇을 했을까요?"
            desc="님다의 2025년 순간들"
          />
        </Container>

        <div className="scroll-container">
          <div className="scroll-track">
            {/* 첫 번째 세트 */}
            {ACTIVITIES_2025.map((act, i) => (
              <div key={`set1-${i}`} className="scroll-card">
                <div className="scroll-card-tag">{act.date}</div>
                <h3 className="scroll-card-title">{act.title}</h3>
                <p className="scroll-card-desc">{act.desc}</p>
                <div className="image-sticker-wrapper">
                  {act.image && <img src={act.image} alt={act.title} className="scroll-card-image" />}
                </div>
              </div>
            ))}
            {/* 두 번째 세트 (무한 루프를 위해 복제) */}
            {ACTIVITIES_2025.map((act, i) => (
              <div key={`set2-${i}`} className="scroll-card">
                <div className="scroll-card-tag">{act.date}</div>
                <h3 className="scroll-card-title">{act.title}</h3>
                <p className="scroll-card-desc">{act.desc}</p>
                <div className="image-sticker-wrapper">
                  {act.image && <img src={act.image} alt={act.title} className="scroll-card-image" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Awords */}
      <section id="awards" className="section">
        <Container>
          <div className="spacer"/>
          <SectionHeader
            title="수상 실적"
          />
          <div className="awardsGrid">
            {AWARDS.map((a,n) => (
              <div key={`${a.year}-${a.name}`} className="awardCard">
                <div className="awardTop">
                  <div className="badge">{a.year}</div>
                </div>
                <div className="awardName">{a.name}</div>
                <img
                  src={`/award${n+1}.png`}
                  alt={`AWARD ${n+1}`}
                  className="awardImage"
                />
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Footer */}
      <footer className="footer">
        <Container>
          <div className="footerGrid">
            <div>
              <div className="footerBrand">
                <img
                  src="/footerlogo.png"
                  alt="NIMDA 로고"
                  className="brandMark"
                />
                <span className="brandText">{CLUB.name}</span>
              </div>
              <p id="footerCopyright" className="p muted">
                © {new Date().getFullYear()} {CLUB.name}. All rights reserved.
              </p>
            </div>

            <div className="footeritems">
              <h3 className="footerTitle">Contact</h3>
              <p className="footertext">{
                <>
                <u>amazingnimda@gmail.com</u><br/>
                <a>학생회관 3층 305호</a>
                </>
              }
              </p>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
}
