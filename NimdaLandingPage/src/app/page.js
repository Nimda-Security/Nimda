
const CLUB = {
  name: "NIMDA",
  tagline: "함께 만들고, 함께 성장하는 보안 동아리",
  shortIntro: [
    "코딩, 웹페이지, 보안에 관심있는 사람들이 모여 함께 성장하는 동아리입니다.",
    "멘토링과 스터디를 통해 공부하고, 동아리 자체 대회와 대외활동에 참여하며 다양한 경험을 쌓는 것을 목표로 합니다.",
  ],
  stats: [
    { label: "활동 기수", value: "10+" },
    { label: "누적 프로젝트", value: "30+" },
    { label: "대회/해커톤 수상", value: "15+" },
  ],
  links: {
    homepage: "https://club.example.com", // 서브도메인으로 교체
    apply: "https://apply.example.com",   // 지원 링크로 교체
  },
};

const ACTIVITIES = [
  {
    title: "프로젝트 빌드",
    desc: "웹/모바일/블록체인/보안 등 관심 분야에서 팀을 꾸려 실제 사용자 문제를 해결합니다.",
    items: ["기획 → 설계 → 개발 → 배포", "코드리뷰 & 테스트 문화", "데모데이 발표"],
  },
  {
    title: "스터디 트랙",
    desc: "입문부터 심화까지 단계별 스터디로 실력을 끌어올립니다.",
    items: ["기초 CS / 웹", "스마트컨트랙트 보안", "리버싱/포렌식 실습"],
  },
  {
    title: "해커톤 & 대회",
    desc: "정기적으로 해커톤/CTF/공모전에 참여하고, 성과를 함께 만듭니다.",
    items: ["팀 매칭 & 멘토링", "제출물/발표 리허설", "회고로 다음 성과 연결"],
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
                src="/nimdalogo.png"
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
        <div className="heroBg" aria-hidden="true" />
        <Container>
          <div className="heroGrid">
            <div className="heroLeft">
              <div className="pill">Recruiting</div>
              <h1 className="h1">
                {CLUB.tagline}
              </h1>
              <p className="p heroP">
                {CLUB.shortIntro.map((line, i) => (
                  <span key={i}>
                    {line}
                    <br/>
                  </span>
                ))}
              </p>

              <div className="stats">
                {CLUB.stats.map((s) => (
                  <div key={s.label} className="stat">
                    <div className="statValue">{s.value}</div>
                    <div className="statLabel">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="glow" aria-hidden="true" />
          </div>
        </Container>
      </main>

      {/* About */}
      <section id="about" className="section">
        <Container>
          <SectionHeader
            eyebrow="About"
            title="동아리는 어떤 곳인가요?"
            desc="실전 중심의 프로젝트와 스터디로 성장을 가속합니다. 함께 만들고, 함께 회고하며, 다음 성과로 연결합니다."
          />

          <div className="grid3">
            <Card
              title="실전 프로젝트"
              desc="작게 만들고 빠르게 배포합니다."
            >
              <ul className="list">
                <li>기획서/요구사항 기반 개발</li>
                <li>코드리뷰, 테스트, 문서화</li>
                <li>배포 및 운영 경험</li>
              </ul>
            </Card>

            <Card
              title="성장 루프"
              desc="스터디 → 실습 → 발표 → 회고"
            >
              <ul className="list">
                <li>기초/심화 트랙 분리 운영</li>
                <li>정기 세션과 과제 기반 학습</li>
                <li>공유 문화(발표/글/리포트)</li>
              </ul>
            </Card>

            <Card
              title="네트워킹"
              desc="팀워크와 협업을 최우선으로"
            >
              <ul className="list">
                <li>멘토/OB 네트워크</li>
                <li>해커톤/공모전 팀 매칭</li>
                <li>협업 툴 기반 워크플로우</li>
              </ul>
            </Card>
          </div>
        </Container>
      </section>

      {/* Activities + Awards */}
      <section id="activities" className="section sectionAlt">
        <Container>
          <SectionHeader
            eyebrow="Activities"
            title="활동 내용"
            desc="프로젝트/스터디/대회 참여를 균형 있게 운영합니다. 아래에는 수상 실적도 함께 정리했습니다."
          />

          <div className="grid3">
            {ACTIVITIES.map((a) => (
              <Card key={a.title} title={a.title} desc={a.desc}>
                <ul className="list">
                  {a.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              </Card>
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
            eyebrow="FAQ"
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
