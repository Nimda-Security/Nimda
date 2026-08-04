// 00 대회 소개 — NIMDACON 최초 진입 랜딩 (피그마 프레임 00)
// 사이드바 없는 풀블리드 다크 히어로 + 스탯/트랙/타임라인/규칙/CTA

import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { CONTEST } from '../contest.config';
import '../Contest.css';

const TERMINAL_LINES: { text: string; color: string }[] = [
  { text: '$ nc judge.nimda.kr 2026', color: 'var(--cl-green)' },
  { text: '[*] handshake ... ok', color: 'var(--cl-fg-mute)' },
  { text: '[*] track     : ALGORITHM / SECURITY', color: 'var(--cl-fg-soft)' },
  { text: `[*] problems  : ${CONTEST.stats.problems}`, color: 'var(--cl-fg-soft)' },
  { text: '[*] languages : C99 / C++17 / Java 17 / Py3', color: 'var(--cl-fg-soft)' },
  { text: '[*] scoring   : realtime', color: 'var(--cl-fg-soft)' },
  { text: '[!] flag fmt  : NIMDA{...}', color: 'var(--cl-yellow)' },
  { text: ' ', color: 'var(--cl-fg-mute)' },
  { text: '$ ready to start? (y/n) y_', color: 'var(--cl-cyan)' },
];

const handleRegister = () => {
  if (CONTEST.registerUrl) {
    window.open(CONTEST.registerUrl, '_blank', 'noopener,noreferrer');
  } else {
    alert('참가 신청은 준비 중입니다. 곧 공지사항으로 안내드릴게요!');
  }
};

const ContestLanding = () => (
  <Layout hideSidebar>
    <div className="contest-landing">
      {/* 히어로 */}
      <section className="contest-bleed contest-landing__dark">
        <div className="contest-landing__inner contest-landing__section">
          <div className="contest-hero">
            <div className="contest-hero__copy">
              <p className="contest-hero__prompt contest-mono">
                nimda@security:~$ ./nimdacon --year {CONTEST.year} --start
              </p>
              <p className="contest-hero__eyebrow contest-mono">
                NIMDA SECURITY · ALGORITHM & CTF CONTEST
              </p>
              <h1 className="contest-hero__logotype contest-mono">
                {'NIMDACON\n' + CONTEST.year}
              </h1>
              <p className="contest-hero__tagline">{CONTEST.tagline}</p>
              <p className="contest-hero__desc">{CONTEST.description}</p>
              <p className="contest-hero__meta contest-mono">
                {CONTEST.periodLabel} · {CONTEST.durationLabel} · {CONTEST.audience}
              </p>
              <div className="contest-hero__cta">
                <button type="button" className="contest-btn contest-btn--on-dark" onClick={handleRegister}>
                  참가 신청
                </button>
                <Link to="/contest/problems" className="contest-btn contest-btn--on-dark-ghost">
                  문제 미리보기
                </Link>
              </div>
            </div>

            {/* 터미널 카드 */}
            <div className="contest-terminal contest-mono">
              <div className="contest-terminal__bar">
                <span className="contest-terminal__dot" style={{ background: 'var(--cl-red)' }} />
                <span className="contest-terminal__dot" style={{ background: 'var(--cl-yellow)' }} />
                <span className="contest-terminal__dot" style={{ background: 'var(--cl-green)' }} />
                <span className="contest-terminal__name">nimdacon.sh</span>
              </div>
              <div className="contest-terminal__body">
                {TERMINAL_LINES.map((line, i) => (
                  <p key={i} style={{ color: line.color }}>
                    {line.text}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 스탯 스트립 */}
      <section className="contest-bleed contest-landing__gray">
        <div className="contest-landing__inner" style={{ padding: '28px 24px' }}>
          <div className="contest-stats">
            {[
              ['참가 인원', CONTEST.stats.participants],
              ['출제 문제', CONTEST.stats.problems],
              ['트랙', CONTEST.stats.tracks],
              ['총 상금', CONTEST.stats.prize],
            ].map(([label, value]) => (
              <div key={label} className="contest-stats__cell">
                <span className="contest-stats__label">{label}</span>
                <span className="contest-stats__value contest-mono">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 트랙 소개 */}
      <section className="contest-bleed" style={{ background: '#ffffff' }}>
        <div className="contest-landing__inner contest-landing__section">
          <div className="contest-section-head">
            <p className="contest-section-head__kicker contest-mono">WHAT WE SOLVE</p>
            <h2 className="contest-section-head__title">두 개의 트랙, 하나의 리더보드</h2>
            <p className="contest-section-head__sub">
              NIMDA는 알고리즘과 정보보안을 함께 다루는 동아리입니다. NIMDACON도 두 갈래를 모두 가져갑니다.
            </p>
          </div>
          <div className="contest-tracks">
            {CONTEST.tracks.map((track) => (
              <div key={track.key} className="contest-track-card">
                <p className="contest-track-card__kicker contest-mono" style={{ color: track.accent }}>
                  {track.kicker}
                </p>
                <h3 className="contest-track-card__title">{track.title}</h3>
                <p className="contest-track-card__body">{track.body}</p>
                <div className="contest-track-card__tags">
                  {track.tags.map((tag) => (
                    <span
                      key={tag}
                      className="contest-badge contest-mono"
                      style={{ color: track.accent, background: `${track.accent}24` }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 진행 일정 */}
      <section className="contest-bleed contest-landing__gray">
        <div className="contest-landing__inner contest-landing__section">
          <div className="contest-section-head">
            <p className="contest-section-head__kicker contest-mono">TIMELINE</p>
            <h2 className="contest-section-head__title">진행 일정</h2>
            <p className="contest-section-head__sub">신청부터 결과 발표까지 4단계로 진행됩니다.</p>
          </div>
          <div className="contest-timeline">
            {CONTEST.timeline.map((step) => (
              <div
                key={step.step}
                className={`contest-step${'current' in step && step.current ? ' contest-step--current' : ''}`}
              >
                <p className="contest-step__num contest-mono">{step.step}</p>
                <div className="contest-step__rule" />
                <p className="contest-step__date contest-mono">{step.date}</p>
                <h3 className="contest-step__title">{step.title}</h3>
                <p className="contest-step__body">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 규칙 */}
      <section id="rules" className="contest-bleed" style={{ background: '#ffffff' }}>
        <div className="contest-landing__inner contest-landing__section">
          <div className="contest-section-head">
            <p className="contest-section-head__kicker contest-mono">RULES</p>
            <h2 className="contest-section-head__title">채점 방식과 유의사항</h2>
          </div>
          <div className="contest-rules">
            <div className="contest-rule-box">
              <h3 className="contest-rule-box__title">채점 방식</h3>
              {CONTEST.rules.scoring.map((rule) => (
                <div key={rule} className="contest-rule-box__item">
                  <span className="contest-rule-box__marker contest-mono" style={{ color: '#4a7fcc' }}>
                    &gt;
                  </span>
                  <span>{rule}</span>
                </div>
              ))}
            </div>
            <div className="contest-rule-box">
              <h3 className="contest-rule-box__title">유의사항</h3>
              {CONTEST.rules.caution.map((rule) => (
                <div key={rule} className="contest-rule-box__item">
                  <span className="contest-rule-box__marker contest-mono" style={{ color: '#d64454' }}>
                    &gt;
                  </span>
                  <span>{rule}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="contest-bleed contest-landing__dark">
        <div className="contest-landing__inner" style={{ padding: '80px 24px' }}>
          <div className="contest-cta">
            <p className="contest-cta__kicker contest-mono">READY TO START ?</p>
            <h2 className="contest-cta__title">{CONTEST.name}에서 만나요</h2>
            <p className="contest-cta__sub">
              신청은 3월 20일 23:59까지 받습니다. 저지 계정은 신청 즉시 발급됩니다.
            </p>
            <div className="contest-cta__buttons">
              <button type="button" className="contest-btn contest-btn--on-dark" onClick={handleRegister}>
                참가 신청
              </button>
              <a href="#rules" className="contest-btn contest-btn--on-dark-ghost">
                대회 규정 보기
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  </Layout>
);

export default ContestLanding;
