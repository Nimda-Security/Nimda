export type RecoveryStep = "info" | "verify" | "result";

const STEPS: { key: RecoveryStep; label: string }[] = [
  { key: "info", label: "기본 정보" },
  { key: "verify", label: "메일 인증" },
  { key: "result", label: "인증 결과" },
];

function StepIndicator({ current }: { current: RecoveryStep }) {
  const currentIndex = STEPS.findIndex((step) => step.key === current);

  return (
    <div className="pr__steps">
      {STEPS.map((step, i) => (
        <span key={step.key} className="pr__steps-item">
          {i > 0 && <span className="pr__steps-dot" />}
          <span
            className={`pr__steps-label ${i === currentIndex ? "pr__steps-label--active" : ""}`}
          >
            {step.label}
          </span>
        </span>
      ))}
    </div>
  );
}

export default StepIndicator;
