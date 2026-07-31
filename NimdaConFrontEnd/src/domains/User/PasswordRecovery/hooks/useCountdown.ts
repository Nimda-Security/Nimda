import { useEffect, useRef, useState } from "react";

/**
 * 초 단위 카운트다운. seconds가 바뀔 때마다 새로 시작한다.
 * 0에 도달하면 onExpire를 한 번 호출한다.
 */
export const useCountdown = (seconds: number, onExpire?: () => void) => {
  const [remaining, setRemaining] = useState(seconds);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    setRemaining(seconds);
    if (seconds <= 0) return;

    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onExpireRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds]);

  const minutes = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const label = `${minutes}:${secs.toString().padStart(2, "0")}`;

  return { remaining, label, isExpired: remaining <= 0 };
};
