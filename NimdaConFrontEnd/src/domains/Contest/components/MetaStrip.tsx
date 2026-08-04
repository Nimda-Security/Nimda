interface MetaStripProps {
  items: { label: string; value: string }[];
}

/** 라벨 행 / 구분선 / 값 행으로 구성된 대회 정보 스트립 (피그마 meta-strip) */
const MetaStrip = ({ items }: MetaStripProps) => (
  <div className="contest-meta">
    <div className="contest-meta__row">
      {items.map((item) => (
        <span key={item.label} className="contest-meta__label">
          {item.label}
        </span>
      ))}
    </div>
    <hr className="contest-divider" />
    <div className="contest-meta__row">
      {items.map((item) => (
        <span key={item.label} className="contest-meta__value">
          {item.value}
        </span>
      ))}
    </div>
    <hr className="contest-divider" />
  </div>
);

export default MetaStrip;
