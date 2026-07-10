import React from "react";
import { Link } from "react-router-dom";
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
          <div style={{ opacity: 0.8, filter: "grayscale(100%) brightness(1.5)" }}>
            <Logo showText={false} />
          </div>

          {/* 주소 */}
          <p style={{ fontSize: "12px", color: "#828282", lineHeight: "1.6" }}>
            31080 충청남도 천안시 서북구 천안대로 1223-24 학생회관 305호
          </p>

          {/* 링크 */}
          <div
            className="layout__footer-links"
            style={{
              display: "flex",
              gap: "16px",
              fontSize: "11px",
              color: "#828282",
            }}
          >
            <Link to="/board/notice/5" style={{ color: "inherit", textDecoration: "none", cursor: "pointer" }}>서비스 이용약관</Link>
            <Link to="/board/notice/6" style={{ color: "inherit", textDecoration: "none", cursor: "pointer" }}>개인정보보호정책</Link>
            <Link to="/board/notice/7" style={{ color: "inherit", textDecoration: "none", cursor: "pointer" }}>청소년보호정책</Link>
            <Link to="/board/notice/8" style={{ color: "inherit", textDecoration: "none", cursor: "pointer" }}>사이트 이용규칙</Link>
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
