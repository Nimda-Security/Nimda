import React from "react";
import Logo from "@/components/icons/Logo";

const Footer: React.FC = () => {
  const [showToast, setShowToast] = React.useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("nimda0410@gmail.com");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <footer className="layout__footer">
      <div className="layout__footer-inner">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
            textAlign: "center",
          }}
        >
          {/* 로고 */}
          <div style={{ opacity: 0.8 }}>
            <Logo />
          </div>

          {/* 주소 */}
          <p style={{ fontSize: "12px", color: "#828282", lineHeight: "1.6" }}>
            31080 충청남도 천안시 서북구 천안대로 1223-24 학생회관 305호
          </p>

          {/* 링크 */}
          <div
            style={{
              display: "flex",
              gap: "16px",
              fontSize: "11px",
              color: "#828282",
            }}
          >
            <span>서비스 이용약관</span>
            <span>개인정보 보호정책</span>
            <span>청소년 보호정책</span>
            <span>사이트 이용규칙</span>
            <span 
              onClick={handleCopyEmail} 
              style={{ cursor: "pointer" }}
            >
              비즈니스 문의
            </span>
          </div>

          {/* 저작권 */}
          <p style={{ fontSize: "11px", color: "#555555" }}>
            © NIMDA Security. All rights reserved.
          </p>
        </div>
      </div>

      {/* 플로팅 토스트 팝업 */}
      {showToast && (
        <div className="copy-toast">
          이메일 주소가 복사되었습니다.
        </div>
      )}
    </footer>
  );
};

export default Footer;
