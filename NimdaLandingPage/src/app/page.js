
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
    items: ["ICPC·UCPC 참여", "해커톤 참여", "동아리 자체 대회(님다콘) 참여"],
  },
  {
    point: "응용",
    title: "프로젝트 & 실습 활동",
    desc: "",
    items: ["ICPC·UCPC 참여", "제출물/발표 리허설", "회고로 다음 성과 연결"],
  },
];

const AWARDS = [
  {
    year: "2025",
    name: "OO 해커톤",
    result: "대상",
    note: "Pay-per-use 결제 기반 서비스 프로토타입",
  },
  {
    year: "2025",
    name: "OO CTF",
    result: "Top 10",
    note: "Web3/크립토 트랙 집중 공략",
  },
  {
    year: "2024",
    name: "OO 공모전",
    result: "최우수상",
    note: "보안 취약점 분석 및 재현 보고서",
  },
];

const FAQ = [
  {
    q: "경험이 없어도 지원할 수 있나요?",
    a: "가능합니다. 입문자를 위한 온보딩과 스터디 트랙이 있으며, 프로젝트는 난이도별로 팀을 구성합니다.",
  },
  {
    q: "활동 방식은 어떤가요?",
    a: "정기 모임 + 팀별 프로젝트 진행이 기본입니다. 시험/일정에 맞춰 유연하게 조정합니다.",
  },
  {
    q: "무엇을 가장 중요하게 보나요?",
    a: "꾸준함, 협업 태도, 배움에 대한 의지입니다. 결과보다 과정과 성장도 함께 봅니다.",
  },
];

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

      {/* Activities + Awards */}
      <section id="activities" className="section sectionAlt">
        <Container>
          <SectionHeader
            title="동아리 활동"
            desc={
              <>
              님다의 활동은 크게 <span className="highlight1">'학습 → 도전 → 응용'</span>의 흐름으로 공부에만 그치지 않고, <span className="highlight3">‘경험’</span>으로 이어집니다
              </>
            }
          />

          <div className="grid3 roadmap-container">            
            {ACTIVITIES.map((a, index) => (
              <div key={a.title} className="roadmap-item">
                {/* 점 */}
                <div className="point"></div>
                
                {/* 타이틀 (점 아래) */}
                <div className="roadmap-title">{a.point}</div>
                
                {/* 호버 카드 (점 위) */}
                <div className="roadmap-card">
                  <Card title={a.title} desc={a.desc}>
                    {Array.isArray(a.items) && (
                      <ul className="list">
                        {a.items.map((it, idx) => (
                          <li key={idx} style={{fontSize: '13px', color: '#ccc'}}>{it}</li>
                        ))}
                      </ul>
                    )}
                  </Card>
                </div>
              </div>
            ))}
          </div>
          <div className="spacer" />

          <div className="awardsWrap">
            <div className="awardsHeader">
              <h3 className="h2 small">수상 실적</h3>
              <p className="p muted">
                실제 데이터로 교체해서 업데이트하세요. (연도/대회명/성과/한 줄 요약)
              </p>
            </div>

            <div className="awardsGrid">
              {AWARDS.map((a) => (
                <div key={`${a.year}-${a.name}`} className="awardCard">
                  <div className="awardTop">
                    <div className="badge">{a.year}</div>
                    <div className="awardResult">{a.result}</div>
                  </div>
                  <div className="awardName">{a.name}</div>
                  <div className="awardNote">{a.note}</div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="section ctaSection">
        <Container>
          <div className="ctaBox">
            <div className="ctaLeft">
              <h3 className="h2">지금 함께할 사람을 찾고 있어요</h3>
              <p className="p muted">
                경험보다 중요한 건 꾸준함과 협업 태도입니다. 지원하고, 팀을 만나고, 바로 만들어 봅시다.
              </p>
            </div>
            <div className="ctaRight">
              <a
                className="btnPrimary"
                href={CLUB.links.apply}
                target="_blank"
                rel="noreferrer"
              >
                지원하러 가기
              </a>
              <a
                className="btnGhost"
                href={CLUB.links.homepage}
                target="_blank"
                rel="noreferrer"
              >
                동아리 홈페이지
              </a>
            </div>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="section">
        <Container>
          <SectionHeader
            title="자주 묻는 질문"
          />

          <div className="faq">
            {FAQ.map((f) => (
              <details key={f.q} className="faqItem">
                <summary className="faqQ">{f.q}</summary>
                <div className="faqA">{f.a}</div>
              </details>
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
                <span className="brandMark" />
                <span className="brandText">{CLUB.name}</span>
              </div>
              <p className="p muted">
                © {new Date().getFullYear()} {CLUB.name}. All rights reserved.
              </p>
            </div>

            <div className="footerLinks">
              <a href="#about">동아리 소개</a>
              <a href="#activities">동아리 활동</a>
              <a href={CLUB.links.homepage} target="_blank" rel="noreferrer">
                홈페이지
              </a>
              <a href={CLUB.links.apply} target="_blank" rel="noreferrer">
                지원하기
              </a>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
}
