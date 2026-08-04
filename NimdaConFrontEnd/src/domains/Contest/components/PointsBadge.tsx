// 배점 → 난이도 배지. 백엔드에 난이도 필드가 없어 points 구간으로 표기한다.
const TIERS = [
  { max: 100, label: '브론즈', color: '#e17654' },
  { max: 200, label: '실버', color: '#8b8b8b' },
  { max: 350, label: '골드', color: '#e8b446' },
  { max: Infinity, label: '플래티넘', color: '#5bc0de' },
] as const;

const PointsBadge = ({ points }: { points: number }) => {
  const tier = TIERS.find((t) => points <= t.max) ?? TIERS[TIERS.length - 1];
  return (
    <span
      className="contest-badge"
      style={{ color: tier.color, background: `${tier.color}24` }}
      title={`${points}점`}
    >
      {tier.label}
    </span>
  );
};

export default PointsBadge;
