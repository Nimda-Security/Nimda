import { useEffect, useRef, useState } from 'react';

type InlineColorPickerProps = {
  value: string;
  onChange: (hex: string) => void;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const normalizeHex = (hex: string) => {
  const upper = hex.trim().toUpperCase();
  if (/^#[0-9A-F]{6}$/.test(upper)) return upper;
  return '#0C0C0C';
};

const hexToRgb = (hex: string) => {
  const normalized = normalizeHex(hex);
  return {
    r: parseInt(normalized.slice(1, 3), 16),
    g: parseInt(normalized.slice(3, 5), 16),
    b: parseInt(normalized.slice(5, 7), 16),
  };
};

const rgbToHex = (r: number, g: number, b: number) => {
  const toHex = (v: number) =>
    clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0').toUpperCase();
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const rgbToHsv = (r: number, g: number, b: number) => {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === rn) h = ((gn - bn) / delta) % 6;
    else if (max === gn) h = (bn - rn) / delta + 2;
    else h = (rn - gn) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }

  const s = max === 0 ? 0 : (delta / max) * 100;
  const v = max * 100;
  return { h, s, v };
};

const hsvToRgb = (h: number, s: number, v: number) => {
  const sn = clamp(s, 0, 100) / 100;
  const vn = clamp(v, 0, 100) / 100;
  const c = vn * sn;
  const hh = (h % 360) / 60;
  const x = c * (1 - Math.abs((hh % 2) - 1));

  let r1 = 0;
  let g1 = 0;
  let b1 = 0;

  if (hh >= 0 && hh < 1) {
    r1 = c;
    g1 = x;
  } else if (hh >= 1 && hh < 2) {
    r1 = x;
    g1 = c;
  } else if (hh >= 2 && hh < 3) {
    g1 = c;
    b1 = x;
  } else if (hh >= 3 && hh < 4) {
    g1 = x;
    b1 = c;
  } else if (hh >= 4 && hh < 5) {
    r1 = x;
    b1 = c;
  } else {
    r1 = c;
    b1 = x;
  }

  const m = vn - c;
  return {
    r: (r1 + m) * 255,
    g: (g1 + m) * 255,
    b: (b1 + m) * 255,
  };
};

function InlineColorPicker({ value, onChange }: InlineColorPickerProps) {
  const squareRef = useRef<HTMLDivElement>(null);
  const [{ h, s, v }, setHsv] = useState(() => {
    const { r, g, b } = hexToRgb(value);
    return rgbToHsv(r, g, b);
  });

  useEffect(() => {
    const { r, g, b } = hexToRgb(value);
    const next = rgbToHsv(r, g, b);
    setHsv(next);
  }, [value]);

  const emitColor = (nextH: number, nextS: number, nextV: number) => {
    const rgb = hsvToRgb(nextH, nextS, nextV);
    onChange(rgbToHex(rgb.r, rgb.g, rgb.b));
  };

  const setSatValFromPoint = (clientX: number, clientY: number) => {
    const square = squareRef.current;
    if (!square) return;

    const rect = square.getBoundingClientRect();
    const sat = clamp(((clientX - rect.left) / rect.width) * 100, 0, 100);
    const val = clamp(100 - ((clientY - rect.top) / rect.height) * 100, 0, 100);

    setHsv((prev) => ({ ...prev, s: sat, v: val }));
    emitColor(h, sat, val);
  };

  const handlePointerDown = (e: { clientX: number; clientY: number }) => {
    setSatValFromPoint(e.clientX, e.clientY);

    const handleMove = (event: PointerEvent) => {
      setSatValFromPoint(event.clientX, event.clientY);
    };

    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  };

  return (
    <div className="bw-inline-color-picker">
      <div
        ref={squareRef}
        className="bw-inline-color-picker__square"
        style={{
          background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${h}, 100%, 50%))`,
        }}
        onPointerDown={handlePointerDown}
      >
        <span
          className="bw-inline-color-picker__thumb"
          style={{ left: `${s}%`, top: `${100 - v}%` }}
        />
      </div>

      <input
        type="range"
        min={0}
        max={360}
        value={Math.round(h)}
        className="bw-inline-color-picker__hue"
        onChange={(e) => {
          const hue = Number(e.target.value);
          setHsv((prev) => ({ ...prev, h: hue }));
          emitColor(hue, s, v);
        }}
      />
    </div>
  );
}

export default InlineColorPicker;
