import { useState, useEffect } from "react";

interface TimeLeft {
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}

interface CountdownState {
  timeLeft: TimeLeft;
  status: "before" | "running" | "after";
}

const Countdown = () => {
  const calculateCountdownState = (): CountdownState => {
    const now = new Date();
    const contestStartDate = new Date("2025-11-27T19:30:00+09:00"); // KST
    const contestEndDate = new Date(
      contestStartDate.getTime() + 2 * 60 * 60 * 1000
    ); // 2 hours later

    let status: "before" | "running" | "after" = "before";
    let difference = contestStartDate.getTime() - now.getTime();
    let timeLeft: TimeLeft = {};

    if (difference > 0) {
      // Before contest
      status = "before";
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    } else {
      // After contest start, check if it's running or finished
      difference = contestEndDate.getTime() - now.getTime();
      if (difference > 0) {
        // Contest is running
        status = "running";
        timeLeft = {
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      } else {
        // Contest is over
        status = "after";
        timeLeft = {};
      }
    }

    return { timeLeft, status };
  };

  const [countdownState, setCountdownState] = useState<CountdownState>(
    calculateCountdownState()
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setCountdownState(calculateCountdownState());
    }, 1000);

    return () => clearTimeout(timer);
  });

  const formatTime = (time: number | undefined) => {
    if (time === undefined) return "00";
    return time < 10 ? `0${time}` : String(time);
  };

  const renderCountdown = () => {
    const { timeLeft, status } = countdownState;

    const timeStyle = "text-7xl md:text-8xl font-bold text-gray-900";
    const finishStyle = "text-7xl md:text-8xl font-bold text-red";
    const labelStyle = "text-sm md:text-base text-gray-500";

    switch (status) {
      case "before":
        return (
          <>
            <h2 className="text-3xl md:text-4xl font-semibold mb-8 text-gray-600">
              대회 시작까지
            </h2>
            <div className="flex justify-center items-baseline space-x-4 md:space-x-8">
              <div className="text-center">
                <div className={timeStyle}>{formatTime(timeLeft.days)}</div>
                <div className={labelStyle}>일</div>
              </div>
              <div className={timeStyle}>:</div>
              <div className="text-center">
                <div className={timeStyle}>{formatTime(timeLeft.hours)}</div>
                <div className={labelStyle}>시간</div>
              </div>
              <div className={timeStyle}>:</div>
              <div className="text-center">
                <div className={timeStyle}>{formatTime(timeLeft.minutes)}</div>
                <div className={labelStyle}>분</div>
              </div>
              <div className={timeStyle}>:</div>
              <div className="text-center">
                <div className={timeStyle}>{formatTime(timeLeft.seconds)}</div>
                <div className={labelStyle}>초</div>
              </div>
            </div>
          </>
        );
      case "running":
        return (
          <>
            <h2 className="text-3xl md:text-4xl font-light mb-8">
              대회 종료까지
            </h2>
            <div className="flex justify-center items-baseline space-x-4 md:space-x-8">
              <div className="text-center">
                <div className={finishStyle}>{formatTime(timeLeft.hours)}</div>
                <div className={labelStyle}>시간</div>
              </div>
              <div className={finishStyle}>:</div>
              <div className="text-center">
                <div className={finishStyle}>
                  {formatTime(timeLeft.minutes)}
                </div>
                <div className={labelStyle}>분</div>
              </div>
              <div className={finishStyle}>:</div>
              <div className="text-center">
                <div className={finishStyle}>
                  {formatTime(timeLeft.seconds)}
                </div>
                <div className={labelStyle}>초</div>
              </div>
            </div>
          </>
        );
      case "after":
        return (
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800">
            대회가 종료되었습니다.
          </h2>
        );
      default:
        return null;
    }
  };

  return <div className="text-center p-8 w-full">{renderCountdown()}</div>;
};

export default Countdown;
