import "./Login.css";
import Layout from "@/components/Layout";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { loginAPI, validateSession } from "@/api/auth";

const LOGIN_ERROR_MESSAGE = "아이디 또는 비밀번호를 잘못 입력했습니다.";
const getSafeReturnPath = (value: unknown): string => {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  try {
    const decodedValue = decodeURIComponent(value);
    if (decodedValue.startsWith("//") || decodedValue.includes("\\")) {
      return "/";
    }

    const target = new URL(value, window.location.origin);
    if (target.origin !== window.location.origin || target.pathname === "/login") {
      return "/";
    }

    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return "/";
  }
};


function LogInPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();
  const [sessionStatus, setSessionStatus] = useState<"checking" | "unauthenticated" | "unavailable">("checking");
  const [sessionRetryCount, setSessionRetryCount] = useState(0);
  const returnPath = getSafeReturnPath(
    (location.state as { from?: unknown } | null)?.from
  );

  useEffect(() => {
    let mounted = true;

    void validateSession().then((session) => {
      if (!mounted) return;

      if (session.status === "authenticated") {
        navigate(returnPath, { replace: true });
        return;
      }

      setSessionStatus(session.status);
    });

    return () => {
      mounted = false;
    };
  }, [navigate, returnPath, sessionRetryCount]);


  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMessage(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const userId = (formData.get("userid") as string)?.trim() ?? "";
    const password = (formData.get("password") as string) ?? "";

    if (!userId || !password) {
      setErrorMessage(LOGIN_ERROR_MESSAGE);
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await loginAPI({ userId, password });

      if (result.success) {
        navigate(returnPath, { replace: true });
      } else {
        setErrorMessage(LOGIN_ERROR_MESSAGE);
      }
    } catch {
      setErrorMessage(LOGIN_ERROR_MESSAGE);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (sessionStatus === "checking") {
    return (
      <Layout hideSidebar>
        <main role="status" aria-live="polite">세션을 확인하는 중입니다...</main>
      </Layout>
    );
  }

  if (sessionStatus === "unavailable") {
    return (
      <Layout hideSidebar>
        <main role="alert">
          <p>세션을 확인할 수 없습니다. 네트워크 연결을 확인한 후 다시 시도해주세요.</p>
          <button type="button" onClick={() => {
            setSessionStatus("checking");
            setSessionRetryCount((count) => count + 1);
          }}>
            다시 시도
          </button>
        </main>
      </Layout>
    );
  }
  return (
    <Layout hideSidebar>
      <div className="login-page">
        <div className="login-page__inner">
          <div className="login-page__brand">
            <h1 className="login-page__title">NIMDA</h1>
          </div>

          <form onSubmit={handleLogin} className="login-page__form">
            <div className="login-page__field">
              <label htmlFor="login-userid" className="sr-only">
                아이디
              </label>
              <input
                id="login-userid"
                name="userid"
                type="text"
                className="login-page__input"
                placeholder="아이디"
                required
                autoComplete="username"
                aria-invalid={errorMessage ? true : undefined}
                aria-describedby={errorMessage ? "login-error" : undefined}
              />
            </div>

            <div className="login-page__field login-page__password-wrap">
              <label htmlFor="login-password" className="sr-only">
                비밀번호
              </label>
              <input
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                className="login-page__input"
                placeholder="비밀번호"
                required
                autoComplete="current-password"
                aria-invalid={errorMessage ? true : undefined}
                aria-describedby={errorMessage ? "login-error" : undefined}
              />
              <button
                type="button"
                className="login-page__password-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                aria-pressed={showPassword}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            {errorMessage && (
              <p id="login-error" className="login-page__error" role="alert" aria-live="assertive">
                {errorMessage}
              </p>
            )}

            <button type="submit" className="login-page__submit" disabled={isSubmitting}>
              {isSubmitting ? "로그인 중..." : "로그인"}
            </button>
          </form>

          <div className="login-page__signup-wrap">
            <button
              type="button"
              className="login-page__signup-link"
              onClick={() => navigate("/signup")}
            >
              회원가입
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default LogInPage;
